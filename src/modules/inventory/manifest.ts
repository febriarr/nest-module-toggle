import { INVENTORY_AVAILABILITY_CAPABILITY } from '../../contracts/capabilities/inventory-availability.port';
import { ModuleManifest } from '../../contracts/module-manifest';

export const inventoryManifest = {
  id: 'inventory',
  name: 'Inventory',
  version: '1.0.0',
  defaultEnabled: false,
  dependencies: { required: ['product'], optional: [] },
  capabilities: { provides: [INVENTORY_AVAILABILITY_CAPABILITY], requires: [] },
} satisfies ModuleManifest;
