import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyController } from 'src/controllers/property/property.controller';
import { PropertyRepository } from 'src/repositories/property.repository';
import { PropertyService } from 'src/services/property.service';

@Module({
  imports: [TypeOrmModule.forFeature([PropertyRepository])],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
