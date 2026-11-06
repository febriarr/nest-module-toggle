import { SetMetadata } from '@nestjs/common';

export const REQUIRES_MODULE = 'requires-module';
export const RequiresModule = (moduleId: string) =>
  SetMetadata(REQUIRES_MODULE, moduleId);
