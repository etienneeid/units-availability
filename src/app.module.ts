import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';
import { AvailabilityModule } from './modules/availability.module';
import { BuildingModule } from './modules/building.module';
import { PropertyModule } from './modules/property.module';
import { ReservationModule } from './modules/reservation.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        Object.assign(await getConnectionOptions(), {
          autoLoadEntities: true,
        }),
    }),
    AvailabilityModule,
    BuildingModule,
    PropertyModule,
    ReservationModule,
  ],
})
export class AppModule {}
