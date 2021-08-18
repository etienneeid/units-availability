import { HttpException, HttpStatus } from '@nestjs/common';

export class InconsecutiveMonthsListException extends HttpException {
  constructor() {
    super(
      'The list of months must only contain consecutive months',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}
