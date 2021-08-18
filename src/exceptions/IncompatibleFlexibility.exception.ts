import { HttpException, HttpStatus } from '@nestjs/common';

export class IncompatibleFlexibilityException extends HttpException {
  constructor() {
    super(
      'The provided month does not have enough left days for this type',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}
