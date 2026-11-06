import { Inject, Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';
import { DRIZZLE } from '../../core/database/database.constants';
import type { Database } from '../../core/database/database.module';
import { stockLevels } from './inventory.schema';
import {
  InventoryAvailabilityPort,
  StockAvailability,
  StockCheckItem,
} from '../../contracts/capabilities/inventory-availability.port';

@Injectable()
export class InventoryService implements InventoryAvailabilityPort {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async checkAvailability(
    items: StockCheckItem[],
  ): Promise<StockAvailability[]> {
    const ids = items.map((i) => i.productId);
    const rows = ids.length
      ? await this.db
          .select()
          .from(stockLevels)
          .where(inArray(stockLevels.productId, ids))
      : [];
    const stock = new Map(rows.map((r) => [r.productId, r.quantity]));

    return items.map((item) => {
      const available = stock.get(item.productId) ?? 0; // tidak ada baris = stok 0
      return {
        productId: item.productId,
        requested: item.quantity,
        available,
        sufficient: available >= item.quantity,
        checked: true,
      };
    });
  }

  async setStock(productId: string, quantity: number) {
    await this.db
      .insert(stockLevels)
      .values({ productId, quantity })
      .onConflictDoUpdate({ target: stockLevels.productId, set: { quantity } });
    return { productId, quantity };
  }
}
