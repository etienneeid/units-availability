import { IsDateString, IsNotEmpty } from 'class-validator';

export class DateFilterDto {
  @IsNotEmpty()
  @IsDateString({ strict: true })
  start: string;

  @IsNotEmpty()
  @IsDateString({ strict: true })
  end: string;
}
