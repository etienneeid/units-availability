import { HttpException, HttpStatus } from '@nestjs/common';

export class MultipleTimeFiltersException extends HttpException {
  constructor() {
    super(
      'Please provide either date or flexibility',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}
