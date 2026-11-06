import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { DRIZZLE } from '../../core/database/database.constants';
import type { Database } from '../../core/database/database.module';
import { products } from './product.schema';

@Injectable()
export class ProductService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(input: { sku: string; name: string; price: number }) {
    const [row] = await this.db.insert(products).values(input).returning();
    return row;
  }

  async list() {
    return this.db.select().from(products);
  }

  async getById(id: string) {
    const [row] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id));
    if (!row) throw new NotFoundException(`Product ${id} tidak ditemukan`);
    return row;
  }

  async findByIds(ids: string[]) {
    if (!ids.length) return [];
    return this.db.select().from(products).where(inArray(products.id, ids));
  }
}
