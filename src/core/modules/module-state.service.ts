import { Inject, Injectable, Logger } from '@nestjs/common';
import { ModuleManifest, ModuleStatus } from '../../contracts/module-manifest';
import { DRIZZLE } from '../database/database.constants';
import { type Database } from '../database/database.module';
import { moduleStates } from './module-state.schema';
import { sql } from 'drizzle-orm';

const MODULE_STATE_LOCK_KEY = 7_301_001;

export type StateValidator = (
  states: ReadonlyMap<string, ModuleStatus>,
) => void;

@Injectable()
export class ModuleStateService {
  private readonly logger = new Logger(ModuleStateService.name);
  private cache = new Map<string, ModuleStatus>();
  private loadedAt = 0;
  private refreshing: Promise<void> | null = null;
  private readonly ttlMs = Number(process.env.MODULE_STATE_TTL_MS ?? 5000);

  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /**
   * Dibaca Resolver & Guard. Hanya menyentuh DB bila cache kadaluarsa
   */
  async isEnabled(moduleId: string): Promise<boolean> {
    await this.ensureFresh();
    return this.cache.get(moduleId) === 'ENABLED';
  }

  async snapshot(): Promise<ReadonlyMap<string, ModuleStatus>> {
    await this.ensureFresh();
    return this.cache;
  }

  /**
   * Buat baris DB untk module barru dengan status default. TIdak menimpa baris yang sudah ada
   */
  async ensureRows(manifests: ModuleManifest[]): Promise<void> {
    if (!manifests.length) return;
    try {
      await this.db
        .insert(moduleStates)
        .values(
          manifests.map((m) => ({
            moduleId: m.id,
            status: (m.defaultEnabled ? 'ENABLED' : 'DISABLED') as ModuleStatus,
            updatedBy: 'bootstrap',
          })),
        )
        .onConflictDoNothing();
    } catch (error) {
      this.logger.error('Gagal memastikan baris status modul', error);
      throw error;
    }
  }

  async warmUp(): Promise<void> {
    await this.reload();
  }

  /**
   * satu-satunya pintu perubahan status. Dipanggil HANYA oleh ModuleManagerService.
   * Baca + Validasi + Tulis terjadi atomik di bawah advisory lock
   */
  async transition(
    moduleId: string,
    next: ModuleStatus,
    validate: StateValidator,
    actor = 'system',
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(${MODULE_STATE_LOCK_KEY})`,
      );
      const rows = await tx.select().from(moduleStates); // baca dari DB, BUKAN cache
      const states = new Map<string, ModuleStatus>(
        rows.map((r) => [r.moduleId, r.status]),
      );
      validate(states); // lempar exception => transaksi rollback
      await tx
        .insert(moduleStates)
        .values({ moduleId, status: next, updatedBy: actor })
        .onConflictDoUpdate({
          target: moduleStates.moduleId,
          set: { status: next, updatedBy: actor, updatedAt: new Date() },
        });
    });
    this.cache.set(moduleId, next); // setelah commit: instance ini langsung melihat perubahan
  }

  private async ensureFresh(): Promise<void> {
    if (Date.now() - this.loadedAt < this.ttlMs) return;
    // Satu reload bersama untuk semua pemanggil serentak (cegah thundering herd).
    this.refreshing ??= this.reload()
      .catch((err) => {
        if (this.loadedAt === 0) throw err; // belum pernah ada data: tidak bisa lanjut
        this.logger.error(
          'Gagal refresh status modul, memakai cache lama',
          err,
        );
        this.loadedAt = Date.now() - this.ttlMs + 1000; // coba lagi sebentar lagi
      })
      .finally(() => {
        this.refreshing = null;
      });
    await this.refreshing;
  }

  private async reload(): Promise<void> {
    const rows = await this.db.select().from(moduleStates);
    this.cache = new Map(rows.map((r) => [r.moduleId, r.status]));
    this.loadedAt = Date.now();
  }
}
