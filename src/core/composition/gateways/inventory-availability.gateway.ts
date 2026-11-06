import { Injectable } from '@nestjs/common';
import { CapabilityResolverService } from '../../capabilities/capability-resolver.service';
import {
  INVENTORY_AVAILABILITY_CAPABILITY,
  InventoryAvailabilityPort,
  StockAvailability,
  StockCheckItem,
} from '../../../contracts/capabilities/inventory-availability.port';

/**
 * Bagi Sales ini "InventoryAvailabilityPort". Bagi Resolver ini consumer biasa.
 * Objek ini tidak pernah berubah; yang berubah adalah hasil resolve() di setiap panggilan.
 */
@Injectable()
export class InventoryAvailabilityGateway implements InventoryAvailabilityPort {
  constructor(private readonly resolver: CapabilityResolverService) {}

  async checkAvailability(
    items: StockCheckItem[],
  ): Promise<StockAvailability[]> {
    const impl = await this.resolver.resolve<InventoryAvailabilityPort>(
      INVENTORY_AVAILABILITY_CAPABILITY,
    );
    return impl.checkAvailability(items);
  }
}
