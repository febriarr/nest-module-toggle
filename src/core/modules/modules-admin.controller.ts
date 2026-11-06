import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ModuleManagerService } from './module-manager.service';

// TODO production: lindungi denan AUTHGUARD dan role admin dan ambil actor dari user login
@Controller('admin/modules')
export class ModulesAdminController {
  constructor(private readonly manager: ModuleManagerService) {}

  @Get()
  list() {
    return this.manager.list();
  }

  @Post(':id/enable')
  @HttpCode(HttpStatus.OK)
  async enable(@Param('id') id: string) {
    await this.manager.enable(id, 'admin');
    return {
      id,
      status: 'ENABLED',
    };
  }

  @Post(':id/disable')
  @HttpCode(HttpStatus.OK)
  async disable(@Param('id') id: string) {
    await this.manager.disable(id, 'admin');
    return {
      id,
      status: 'DISABLED',
    };
  }
}
