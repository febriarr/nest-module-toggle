import { Injectable } from '@nestjs/common';
import {
  InventoryAvailabilityPort,
  StockAvailability,
  StockCheckItem,
} from '../../contracts/capabilities/inventory-availability.port';

/**
 * Dipakai saat modul Inventory DISABLED. Keputusan bisnis: stok tidak dilacak, penjualan tetap boleh.
 * `checked:false` memberi tahu consumer bahwa angka ini BUKAN hasil verifikasi stok.
 */
@Injectable()
export class InventoryDisabledService implements InventoryAvailabilityPort {
  async checkAvailability(
    items: StockCheckItem[],
  ): Promise<StockAvailability[]> {
    return items.map((item) => ({
      productId: item.productId,
      requested: item.quantity,
      available: null,
      sufficient: true,
      checked: false,
    }));
  }
}
