import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CheckAvailabilityDto } from '../../dtos/check-availability.dto';
import { PropertyService } from 'src/services/property.service';
import { IPropertyAvailabilityCheckResult } from 'src/interfaces/property-availability-check-result.interface';

@Controller('property')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @Post('/availability')
  @HttpCode(200)
  async checkAvailability(
    @Body() checkAvailabilityDto: CheckAvailabilityDto,
  ): Promise<IPropertyAvailabilityCheckResult> {
    return await this.propertyService.checkAvailability(checkAvailabilityDto);
  }
}
