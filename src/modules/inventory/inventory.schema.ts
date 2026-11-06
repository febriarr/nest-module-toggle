import { integer, pgTable, uuid } from 'drizzle-orm/pg-core';
import { products } from '../product/product.schema';

export const stockLevels = pgTable('stock_levels', {
  productId: uuid('product_id')
    .primaryKey()
    .references(() => products.id),
  quantity: integer('quantity').notNull().default(0),
});
