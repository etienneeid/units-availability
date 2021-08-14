import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { City } from 'src/enums/city.enum';
import { Amenities } from 'src/enums/amenities.enum';
import { PropertyType } from 'src/enums/property-type.enum';
import { DateFilterDto } from './date-filter.dto';
import { FlexibleFilterDto } from './flexible-filter.dto';

export class CheckAvailabilityDto {
  @IsNotEmpty()
  @IsEnum(City)
  city: City;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateFilterDto)
  date: DateFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FlexibleFilterDto)
  flexible: FlexibleFilterDto;

  @IsOptional()
  @IsEnum(PropertyType)
  apartmentType: PropertyType;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Amenities, { each: true })
  amenities: Amenities[];
}
