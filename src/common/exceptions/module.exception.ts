import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class ModuleNotRegisteredException extends AppException {
  constructor(moduleId: string) {
    super(
      'MODULE_NOT_REGISTERED',
      `Modul '${moduleId}' tidak terdaftar`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class DuplicateModuleException extends AppException {
  constructor(moduleId: string) {
    super(
      'MODULE_DUPLICATE',
      `Modul '${moduleId}' terdaftar lebih dari sekali`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class ModuleGraphInvalidException extends AppException {
  constructor(reason: string) {
    super(
      'MODULE_GRAPH_INVALID',
      `Graf modul tidak valid: ${reason}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class RequiredDependenciesDisabledException extends AppException {
  constructor(moduleId: string, missing: string[]) {
    super(
      'MODULE_DEPENDENCY_DISABLED',
      `Modul '${moduleId}' tidak bisa diaktifkan, dependensi belum aktif: ${missing.join(', ')}`,
      HttpStatus.CONFLICT,
      { missing },
    );
  }
}

export class ModuleHasActiveDependentsException extends AppException {
  constructor(moduleId: string, dependents: string[]) {
    super(
      'MODULE_HAS_ACTIVE_DEPENDENTS',
      `Modul '${moduleId}' tidak bisa dinonaktifkan, masih dipakai oleh: ${dependents.join(', ')}`,
      HttpStatus.CONFLICT,
      { dependents },
    );
  }
}

export class ModuleDisabledException extends AppException {
  constructor(moduleId: string) {
    super(
      'MODULE_DISABLED',
      `Modul '${moduleId}' sedang dinonaktifkan`,
      HttpStatus.FORBIDDEN,
    );
  }
}
