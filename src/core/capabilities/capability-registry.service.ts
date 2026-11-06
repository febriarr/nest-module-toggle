import { Injectable } from '@nestjs/common';
import {
  CapabilityNotBoundException,
  CapabilityWiringException,
} from '../../common/exceptions/capability.exception';
import type { CapabilityBinding } from './capability-binding';

@Injectable()
export class CapabilityRegistryService {
  private readonly bindings = new Map<string, CapabilityBinding>();

  register(binding: CapabilityBinding): void {
    if (this.bindings.has(binding.key)) {
      throw new CapabilityWiringException(
        `capability '${binding.key}' terdaftar lebih dari sekali`,
      );
    }
    this.bindings.set(binding.key, binding);
  }

  has(key: string): boolean {
    return this.bindings.has(key);
  }

  getOrThrow(key: string): CapabilityBinding {
    const binding = this.bindings.get(key);
    if (!binding) throw new CapabilityNotBoundException(key);
    return binding;
  }

  list(): CapabilityBinding[] {
    return [...this.bindings.values()];
  }
}
