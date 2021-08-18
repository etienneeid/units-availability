import { HttpException, HttpStatus } from '@nestjs/common';

export class MultipleTimeFiltersException extends HttpException {
  constructor() {
    super('Please provide either date or flexible', HttpStatus.NOT_ACCEPTABLE);
  }
}
