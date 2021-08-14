import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { City } from '../enums/city.enum';
import { Property } from './property.entity';

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

  @OneToMany(() => Property, (property) => property.building)
  properties: Property[];
}
