import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ModuleEnabledGuard } from './module-enabled.guard';
import { ModuleManagerService } from './module-manager.service';
import { ModuleRegistryService } from './module-registry.service';
import { ModuleStateService } from './module-state.service';
import { ModulesAdminController } from './modules-admin.controller';

@Global()
@Module({
  controllers: [ModulesAdminController],
  providers: [
    ModuleRegistryService,
    ModuleStateService,
    ModuleManagerService,
    { provide: APP_GUARD, useClass: ModuleEnabledGuard }, // berlaku ke semua route yang memakai @RequiresModule
  ],
  exports: [ModuleRegistryService, ModuleStateService, ModuleManagerService],
})
export class ModulesCoreModule {}
