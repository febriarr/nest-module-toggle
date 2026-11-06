import { ModuleManifest } from '../../contracts/module-manifest';
import { inventoryManifest } from '../../modules/inventory/manifest';
import { productManifest } from '../../modules/product/manifest';
import { salesManifest } from '../../modules/sales/manifest';

export const moduleManifests: ModuleManifest[] = [
  productManifest,
  inventoryManifest,
  salesManifest,
];
