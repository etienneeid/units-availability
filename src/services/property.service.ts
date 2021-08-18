import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckAvailabilityDto } from '../dtos/check-availability.dto';
import { validateDateAndFlexibility } from 'src/utils/validateDateAndFlexibility';
import { PropertyRepository } from 'src/repositories/property.repository';
import { IPropertyAvailabilityCheckResult } from 'src/interfaces/property-availability-check-result.interface';
import { getMatchingProperties } from 'src/helpers/property/getMatchingProperties';
import { getAlternativeProperties } from 'src/helpers/property/getAlternativeProperties';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(PropertyRepository)
    private availabilityRepository: PropertyRepository,
  ) {}

  /**
   * Returns
   * list of properties matching the criteria if any
   * if no match found
   * list of alternative properties if any
   * list of other properties if any
   *
   * @param {CheckAvailabilityDto} checkAvailabilityDto
   * @returns IPropertyAvailabilityCheckResult
   */
  async checkAvailability(
    checkAvailabilityDto: CheckAvailabilityDto,
  ): Promise<IPropertyAvailabilityCheckResult> {
    validateDateAndFlexibility(checkAvailabilityDto);
    const result: IPropertyAvailabilityCheckResult = {
      match: [],
      alternative: [],
      other: [],
    };
    result.match = await getMatchingProperties(checkAvailabilityDto);

    if (!result.match.length) {
      const promises: Promise<any>[] = [
        getAlternativeProperties(checkAvailabilityDto),
      ];
      if (checkAvailabilityDto.apartmentType) {
        delete checkAvailabilityDto.apartmentType;
        promises.push(getMatchingProperties(checkAvailabilityDto));
      }
      const [alternative, other] = await Promise.all(promises);

      result.alternative = alternative;
      result.other = other || result.other;
    }

    return result;
  }
}
