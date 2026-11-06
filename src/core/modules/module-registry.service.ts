import { Injectable } from '@nestjs/common';
import { ModuleManifest } from '../../contracts/module-manifest';
import {
  DuplicateModuleException,
  ModuleGraphInvalidException,
  ModuleNotRegisteredException,
} from '../../common/exceptions/module.exception';

@Injectable()
export class ModuleRegistryService {
  private readonly manifests = new Map<string, ModuleManifest>();

  register(manifest: ModuleManifest): void {
    if (this.manifests.has(manifest.id))
      throw new DuplicateModuleException(manifest.id);
    this.manifests.set(manifest.id, manifest);
  }

  has(id: string): boolean {
    return this.manifests.has(id);
  }

  getOrThrow(id: string): ModuleManifest {
    const manifest = this.manifests.get(id);
    if (!manifest) throw new ModuleNotRegisteredException(id);
    return manifest;
  }

  list(): ModuleManifest[] {
    return [...this.manifests.values()];
  }

  /**
   * Module lain yang `required`-nya membuat moduleId. `optional` sengaja tidak dihitung
   */
  dependentsOf(moduleId: string): ModuleManifest[] {
    return this.list().filter((m) =>
      m.dependencies.required.includes(moduleId),
    );
  }

  /**
   * Dipanggil sekali setelah semua manifest terdaftar, Gagal = aplikasi tidak start
   */
  validateGraph(): void {
    for (const m of this.list()) {
      for (const dep of [
        ...m.dependencies.required,
        ...m.dependencies.optional,
      ]) {
        if (!this.manifests.has(dep)) {
          throw new ModuleGraphInvalidException(
            `${m.id} bergantung pada ${dep} yang tidak terdaftar`,
          );
        }
      }
      /**
       * Default state harus konsisten: module default-ENABLED tidak boleh punya required yang default-DISABLED
       */
      if (m.defaultEnabled) {
        const bad = m.dependencies.required.filter(
          (d) => !this.manifests.get(d)!.defaultEnabled,
        );
        if (bad.length) {
          throw new ModuleGraphInvalidException(
            `${m.id} defaultEnabled tapi required ${bad.join(', ')} tidak defaultEnabled`,
          );
        }
      }
    }
    this.assertNoCycles();
  }

  private assertNoCycles(): void {
    const visiting = new Set<string>();
    const done = new Set<string>();
    const visit = (id: string, path: string[]) => {
      if (done.has(id)) return;
      if (visiting.has(id))
        throw new ModuleGraphInvalidException(
          `Cycle detected: ${[...path, id].join(' -> ')}`,
        );
      visiting.add(id);
      for (const dep of this.manifests.get(id)!.dependencies.required)
        visit(dep, [...path, id]);
      visiting.delete(id);
      done.add(id);
    };
  }
}
