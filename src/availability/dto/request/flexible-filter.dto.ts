import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
} from 'class-validator';
import { AvailabilityFlexibility } from 'src/availability/availability-flexibility.enum';
import { months } from 'src/constants';

export class FlexibleFilterDto {
  @IsNotEmpty()
  @IsEnum(AvailabilityFlexibility)
  type: AvailabilityFlexibility;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(Object.keys(months), { each: true })
  months: string[];
}
