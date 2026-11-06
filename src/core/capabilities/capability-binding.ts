import { Type } from '@nestjs/common';

export interface CapabilityBinding {
  key: string; // contoh 'inventory.availability'
  providerModuleId: string; // Status modul ini menentukan implementasi yang akan dipilih
  whenEnabled: Type<unknown>;
  whenDisabled: Type<unknown>;
}
