import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyRepository } from 'src/repositories/property.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PropertyRepository])],
})
export class PropertyModule {}
