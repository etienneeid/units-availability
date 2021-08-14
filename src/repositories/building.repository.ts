import { EntityRepository, Repository } from 'typeorm';
import { Building } from '../entities/building.entity';

@EntityRepository(Building)
export class BuildingRepository extends Repository<Building> {}
