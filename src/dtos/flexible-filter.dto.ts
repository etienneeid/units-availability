import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
} from 'class-validator';
import { FlexibilityType } from 'src/enums/flexibility-type.enum';
import { months } from 'src/constants';

export class FlexibleFilterDto {
  @IsNotEmpty()
  @IsEnum(FlexibilityType)
  type: FlexibilityType;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(Object.keys(months), { each: true })
  months: string[];
}
