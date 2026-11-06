import { Module } from '@nestjs/common';
import { ProductModule } from '../product/product.module';
import { InventoryController } from './inventory.controller';
import { InventoryDisabledService } from './inventory-disabled.service';
import { InventoryService } from './inventory.service';

@Module({
  imports: [ProductModule], // Product = required, aman di-import
  controllers: [InventoryController],
  providers: [InventoryService, InventoryDisabledService],
  exports: [], // SENGAJA kosong: modul lain tidak boleh menginjeksi InventoryService. Akses hanya lewat Port.
})
export class InventoryModule {}
