import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Amenities } from '../enums/amenities.enum';
import { PropertyType } from '../enums/property-type.enum';
import { Availability } from './availability.entity';
import { Building } from './building.entity';
import { Reservation } from './reservation.entity';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'building_id',
    type: 'integer',
    nullable: false,
  })
  buildingId: number;

  @Column({
    type: 'text',
    nullable: false,
    unique: true,
  })
  title: string;

  @Column({
    name: 'property_type',
    type: 'enum',
    enum: PropertyType,
    nullable: false,
  })
  propertyType: PropertyType;

  @Column({
    type: 'enum',
    enum: Amenities,
    nullable: false,
  })
  amenities: Amenities[];

  @OneToMany(
    () => Availability,
    (availability: Availability) => availability.property,
  )
  availabilities: Availability[];

  @OneToMany(
    () => Reservation,
    (reservation: Reservation) => reservation.property,
  )
  reservations: Reservation[];

  @ManyToOne(() => Building, (building: Building) => building.properties, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'building_id' })
  building: Building;
}
