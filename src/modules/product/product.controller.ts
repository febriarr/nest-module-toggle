import { Body, Controller, Get, Post } from '@nestjs/common';
import { RequiresModule } from '../../core/modules/requires-module.decorator';
import { ProductService } from './product.service';

@RequiresModule('product')
@Controller('products')
export class ProductController {
  constructor(private readonly products: ProductService) {}

  @Post()
  create(@Body() body: { sku: string; name: string; price: number }) {
    return this.products.create(body);
  }

  @Get()
  list() {
    return this.products.list();
  }
}
