import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildingRepository } from 'src/repositories/building.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BuildingRepository])],
})
export class BuildingModule {}
