import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../core/database/database.constants';
import type { Database } from '../../core/database/database.module';
import { ProductService } from '../product/product.service';
import { salesOrderItems, salesOrders } from './sales.schema';
import {
  INVENTORY_AVAILABILITY_PORT,
  type InventoryAvailabilityPort,
} from '../../contracts/capabilities/inventory-availability.port';

@Injectable()
export class SalesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly products: ProductService, // required dependency: langsung
    @Inject(INVENTORY_AVAILABILITY_PORT)
    private readonly inventory: InventoryAvailabilityPort, // optional: via Port
  ) {}

  async createDraft(items: { productId: string; quantity: number }[]) {
    const found = await this.products.findByIds(items.map((i) => i.productId));
    const priceById = new Map(found.map((p) => [p.id, p.price]));
    const missing = items.filter((i) => !priceById.has(i.productId));
    if (missing.length)
      throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', missing });

    return this.db.transaction(async (tx) => {
      const [order] = await tx.insert(salesOrders).values({}).returning();
      await tx.insert(salesOrderItems).values(
        items.map((i) => ({
          orderId: order.id,
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: priceById.get(i.productId)!,
        })),
      );
      return order;
    });
  }

  async confirmOrder(orderId: string) {
    const [order] = await this.db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, orderId));
    if (!order) throw new NotFoundException(`Order ${orderId} tidak ditemukan`);
    if (order.status !== 'DRAFT')
      throw new ConflictException(`Order sudah ${order.status}`);

    const items = await this.db
      .select()
      .from(salesOrderItems)
      .where(eq(salesOrderItems.orderId, orderId));

    // Sales tidak tahu ini InventoryService, InventoryDisabledService, atau apa pun. Cuma tahu Port.
    const availability = await this.inventory.checkAvailability(
      items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    );

    const insufficient = availability.filter((a) => a.checked && !a.sufficient);
    if (insufficient.length) {
      throw new UnprocessableEntityException({
        code: 'INSUFFICIENT_STOCK',
        items: insufficient,
      });
    }

    await this.db
      .update(salesOrders)
      .set({ status: 'CONFIRMED' })
      .where(eq(salesOrders.id, orderId));

    return {
      orderId,
      status: 'CONFIRMED' as const,
      stockChecked: availability.every((a) => a.checked), // false => Inventory sedang DISABLED
    };
  }
}
