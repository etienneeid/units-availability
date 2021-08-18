import { EntityRepository, Repository } from 'typeorm';
import { Property } from '../entities/property.entity';

@EntityRepository(Property)
export class PropertyRepository extends Repository<Property> {}
