import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidDateFilterValuesException extends HttpException {
  constructor() {
    super(
      'The end date must be greater than the start date',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}
