import { ModuleManifest } from '../../contracts/module-manifest';

export const productManifest = {
  id: 'product',
  name: 'Product',
  version: '1.0.0',
  defaultEnabled: true,
  dependencies: { required: [], optional: [] },
  capabilities: { provides: [], requires: [] },
} satisfies ModuleManifest;
