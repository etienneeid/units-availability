import { HttpException, HttpStatus } from '@nestjs/common';

export class PastStartDateException extends HttpException {
  constructor() {
    super(
      'The start date must be greater or equal to today',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}
