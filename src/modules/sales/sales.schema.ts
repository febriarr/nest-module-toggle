import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { products } from '../product/product.schema';

export const salesOrders = pgTable('sales_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: varchar('status', { length: 16 })
    .$type<'DRAFT' | 'CONFIRMED'>()
    .notNull()
    .default('DRAFT'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const salesOrderItems = pgTable('sales_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => salesOrders.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(), // Rupiah utuh
});
