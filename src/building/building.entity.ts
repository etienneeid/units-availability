import { Property } from 'src/property/property.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { City } from './building.model';

@Entity()
export class Building {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: City,
    nullable: false,
  })
  city: City;

  @OneToMany(() => Property, (property: Property) => property.building)
  properties: Property[];
}
