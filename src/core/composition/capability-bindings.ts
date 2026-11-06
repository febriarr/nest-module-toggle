import type { CapabilityBinding } from '../capabilities/capability-binding';
import { InventoryDisabledService } from '../../modules/inventory/inventory-disabled.service';
import { InventoryService } from '../../modules/inventory/inventory.service';
import { INVENTORY_AVAILABILITY_CAPABILITY } from '../../contracts/capabilities/inventory-availability.port';

export const capabilityBindings: CapabilityBinding[] = [
  {
    key: INVENTORY_AVAILABILITY_CAPABILITY,
    providerModuleId: 'inventory',
    whenEnabled: InventoryService,
    whenDisabled: InventoryDisabledService,
  },
];
