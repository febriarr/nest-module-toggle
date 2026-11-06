import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleStateService } from './module-state.service';
import { REQUIRES_MODULE } from './requires-module.decorator';
import { ModuleDisabledException } from '../../common/exceptions/module.exception';

@Injectable()
export class ModuleEnabledGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly state: ModuleStateService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const moduleId = this.reflector.getAllAndOverride<string | undefined>(
      REQUIRES_MODULE,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!moduleId) return true;
    if (await this.state.isEnabled(moduleId)) return true;
    throw new ModuleDisabledException(moduleId);
  }
}
