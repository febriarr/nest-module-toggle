import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ModuleStateService } from '../modules/module-state.service';
import { CapabilityRegistryService } from './capability-registry.service';

@Injectable()
export class CapabilityResolverService {
  constructor(
    private readonly registry: CapabilityRegistryService,
    private readonly state: ModuleStateService,
    private readonly moduleRef: ModuleRef,
  ) {}

  /** Mengembalikan implementasi yang SEDANG berlaku. Tidak membuat instance, tidak mengubah provider. */
  async resolve<T>(key: string): Promise<T> {
    const binding = this.registry.getOrThrow(key);
    const enabled = await this.state.isEnabled(binding.providerModuleId); // cache, bukan query tiap panggilan
    const token = enabled ? binding.whenEnabled : binding.whenDisabled;
    // strict:false => cari di seluruh aplikasi, jadi InventoryModule tidak perlu export apa pun.
    return this.moduleRef.get<T>(token, { strict: false });
  }
}
