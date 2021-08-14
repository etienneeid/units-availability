import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityController } from '../controllers/availability/availability.controller';
import { AvailabilityRepository } from '../repositories/availability.repository';
import { AvailabilityService } from '../services/availability.service';

@Module({
  imports: [TypeOrmModule.forFeature([AvailabilityRepository])],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
