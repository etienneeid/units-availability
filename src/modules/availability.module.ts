import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityRepository } from '../repositories/availability.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AvailabilityRepository])],
})
export class AvailabilityModule {}
