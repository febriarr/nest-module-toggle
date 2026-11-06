import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CapabilityWiringException } from '../../common/exceptions/capability.exception';
import { CapabilityRegistryService } from '../capabilities/capability-registry.service';
import { ModuleRegistryService } from '../modules/module-registry.service';
import { ModuleStateService } from '../modules/module-state.service';
import { capabilityBindings } from './capability-bindings';
import { moduleManifests } from './module-manifests';

@Injectable()
export class CompositionBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CompositionBootstrapService.name);

  constructor(
    private readonly modules: ModuleRegistryService,
    private readonly capabilities: CapabilityRegistryService,
    private readonly state: ModuleStateService,
    private readonly moduleRef: ModuleRef,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // 1. Manifest -> ModuleRegistry
    moduleManifests.forEach((m) => this.modules.register(m));
    this.modules.validateGraph();

    // 2. Binding -> CapabilityRegistry
    capabilityBindings.forEach((b) => this.capabilities.register(b));
    this.validateCapabilityWiring();

    // 3. Pastikan baris status ada di DB, lalu isi cache
    await this.state.ensureRows(this.modules.list());
    await this.state.warmUp();

    this.logger.log(
      `Modul terdaftar: ${this.modules
        .list()
        .map((m) => m.id)
        .join(', ')}`,
    );
  }

  /** Manifest = peta. Di sini peta dicocokkan dengan kabel yang benar-benar terpasang. */
  private validateCapabilityWiring(): void {
    for (const manifest of this.modules.list()) {
      for (const key of manifest.capabilities.requires) {
        if (!this.capabilities.has(key)) {
          throw new CapabilityWiringException(
            `'${manifest.id}' membutuhkan '${key}' tapi tidak ada binding`,
          );
        }
      }
      for (const key of manifest.capabilities.provides) {
        const binding = this.capabilities.has(key)
          ? this.capabilities.getOrThrow(key)
          : undefined;
        if (!binding || binding.providerModuleId !== manifest.id) {
          throw new CapabilityWiringException(
            `'${manifest.id}' mengaku menyediakan '${key}' tapi binding tidak cocok`,
          );
        }
      }
    }

    // Kedua implementasi harus benar-benar ada di DI container (gagal sekarang, bukan saat request).
    for (const b of this.capabilities.list()) {
      for (const token of [b.whenEnabled, b.whenDisabled]) {
        try {
          this.moduleRef.get(token, { strict: false });
        } catch {
          throw new CapabilityWiringException(
            `'${token.name}' untuk '${b.key}' tidak ditemukan di DI container (modulnya sudah di-import di AppModule?)`,
          );
        }
      }
    }
  }
}
