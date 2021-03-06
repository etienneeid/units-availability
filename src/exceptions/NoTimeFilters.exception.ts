import { HttpException, HttpStatus } from '@nestjs/common';

export class NoTimeFiltersException extends HttpException {
  constructor() {
    super(
      'Please provide at least date or flexible',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}
