import { EntityRepository, Repository } from 'typeorm';
import { Availability } from '../entities/availability.entity';

@EntityRepository(Availability)
export class AvailabilityRepository extends Repository<Availability> {}
