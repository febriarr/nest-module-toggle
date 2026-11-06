import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class CapabilityNotBoundException extends AppException {
  constructor(key: string) {
    super(
      'CAPABILITY_NOT_BOUND',
      `Capability '${key}' belum punya binding`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class CapabilityWiringException extends AppException {
  constructor(reason: string) {
    super(
      'CAPABILITY_WIRING_INVALID',
      `Wiring capability tidak valid: ${reason}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
