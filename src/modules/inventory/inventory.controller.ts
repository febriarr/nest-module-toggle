import { Body, Controller, Param, Put } from '@nestjs/common';
import { RequiresModule } from '../../core/modules/requires-module.decorator';
import { InventoryService } from './inventory.service';

@RequiresModule('inventory') // modul DISABLED => semua route ini ditolak
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Put(':productId/stock')
  setStock(
    @Param('productId') productId: string,
    @Body() body: { quantity: number },
  ) {
    return this.inventory.setStock(productId, body.quantity);
  }
}
