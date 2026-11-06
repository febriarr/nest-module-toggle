import { INVENTORY_AVAILABILITY_CAPABILITY } from '../../contracts/capabilities/inventory-availability.port';
import { ModuleManifest } from '../../contracts/module-manifest';

export const salesManifest = {
  id: 'sales',
  name: 'Sales',
  version: '1.0.0',
  defaultEnabled: true,
  dependencies: { required: ['product'], optional: ['inventory'] },
  capabilities: { provides: [], requires: [INVENTORY_AVAILABILITY_CAPABILITY] },
} satisfies ModuleManifest;
