import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], // Product adalah dependensi `required` bagi modul lain: boleh di-import langsung
})
export class ProductModule {}
