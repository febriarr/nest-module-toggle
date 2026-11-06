import { Global, Module } from '@nestjs/common';
import { CompositionBootstrapService } from './composition-bootstrap.service';
import { InventoryAvailabilityGateway } from './gateways/inventory-availability.gateway';
import { INVENTORY_AVAILABILITY_PORT } from '../../contracts/capabilities/inventory-availability.port';

@Global()
@Module({
  providers: [
    // Sales menginjeksi TOKEN ini, tidak tahu class apa di baliknya.
    {
      provide: INVENTORY_AVAILABILITY_PORT,
      useClass: InventoryAvailabilityGateway,
    },
    CompositionBootstrapService,
  ],
  exports: [INVENTORY_AVAILABILITY_PORT],
})
export class CompositionModule {}
