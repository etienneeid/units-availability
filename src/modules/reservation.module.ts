import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationRepository } from 'src/repositories/reservation.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReservationRepository])],
})
export class ReservationModule {}
