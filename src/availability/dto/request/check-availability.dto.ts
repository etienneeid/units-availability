import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { City } from 'src/building/building-city.enum';
import { PropertyAmenities } from 'src/property/property-amenities.enum';
import { PropertyType } from 'src/property/property-type.enum';
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
  @IsEnum(PropertyAmenities, { each: true })
  amenities: PropertyAmenities[];
}
