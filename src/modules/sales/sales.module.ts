import { Module } from '@nestjs/common';
import { ProductModule } from '../product/product.module';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [ProductModule], // HANYA Product
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
