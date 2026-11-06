import { Body, Controller, Param, Post } from '@nestjs/common';
import { RequiresModule } from '../../core/modules/requires-module.decorator';
import { SalesService } from './sales.service';

@RequiresModule('sales')
@Controller('sales/orders')
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Post()
  create(@Body() body: { items: { productId: string; quantity: number }[] }) {
    return this.sales.createDraft(body.items);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.sales.confirmOrder(id);
  }
}
