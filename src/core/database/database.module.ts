import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DRIZZLE } from './database.constants';

export type Database = NodePgDatabase;
const POOL = Symbol('PG_POOL');

@Global()
@Module({
  providers: [
    {
      provide: POOL,
      useFactory: () =>
        new Pool({ connectionString: process.env.DATABASE_URL }),
    },
    {
      provide: DRIZZLE,
      inject: [POOL],
      useFactory: (pool: Pool): Database => drizzle({ client: pool }),
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(POOL) private readonly pool: Pool) {}
  async onApplicationShutdown() {
    await this.pool.end();
  }
}
