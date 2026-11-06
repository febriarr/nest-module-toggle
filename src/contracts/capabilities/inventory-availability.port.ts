// Nama capability: dipakai di manifest dan di binding (satu sumber untuk menghindari typo)
export const INVENTORY_AVAILABILITY_CAPABILITY =
  'inventory-availability' as const;

// Token DI yang di inject ke consumer, Symbol dipakai karena interface TS hilang saat runtime
export const INVENTORY_AVAILABILITY_PORT = Symbol(
  'INVENTORY_AVAILABILITY_PORT',
);

export interface StockCheckItem {
  productId: string;
  quantity: number;
}

export interface StockAvailability {
  productId: string;
  requested: number;
  available: number | null; // null = stock tidak dilacak
  sufficient: boolean;
  checked: boolean; // false = hasil dari fallback (INventory disabled)
}

// Semua method Wajib async: Gateway meneruskan panggilan setelah resolve (yang async)
export interface InventoryAvailabilityPort {
  checkAvailability(items: StockCheckItem[]): Promise<StockAvailability[]>;
}
