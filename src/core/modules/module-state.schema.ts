import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { ModuleStatus } from '../../contracts/module-manifest';

export const moduleStates = pgTable('module_states', {
  moduleId: varchar('module_id', { length: 64 }).primaryKey(),
  status: varchar('status', { length: 16 })
    .$type<ModuleStatus>()
    .notNull()
    .default('DISABLED'),
  updatedBy: varchar('updated_by', { length: 128 }),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
