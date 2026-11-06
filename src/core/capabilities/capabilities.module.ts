import { Global, Module } from '@nestjs/common';
import { CapabilityRegistryService } from './capability-registry.service';
import { CapabilityResolverService } from './capability-resolver.service';

@Global()
@Module({
  providers: [CapabilityRegistryService, CapabilityResolverService],
  exports: [CapabilityRegistryService, CapabilityResolverService],
})
export class CapabilitiesModule {}
