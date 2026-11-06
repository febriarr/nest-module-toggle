import { Module } from '@nestjs/common';
import { CapabilitiesModule } from './core/capabilities/capabilities.module';
import { CompositionModule } from './core/composition/composition.module';
import { DatabaseModule } from './core/database/database.module';
import { ModulesCoreModule } from './core/modules/modules-core.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductModule } from './modules/product/product.module';
import { SalesModule } from './modules/sales/sales.module';

@Module({
  imports: [
    // core (infrastruktur)
    DatabaseModule,
    ModulesCoreModule,
    CapabilitiesModule,
    CompositionModule,
    // modul bisnis: SEMUA selalu dimuat. ENABLED/DISABLED hanya status logis di DB.
    ProductModule,
    InventoryModule,
    SalesModule,
  ],
})
export class AppModule {}
