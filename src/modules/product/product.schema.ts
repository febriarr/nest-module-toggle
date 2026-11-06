import { integer, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: varchar('sku', { length: 64 }).notNull().unique(),
  name: text('name').notNull(),
  price: integer('price').notNull(), // Rupiah utuh
});
