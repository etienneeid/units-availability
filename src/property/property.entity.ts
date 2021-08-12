import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Building } from 'src/building/building.entity';
import { PropertyAmenities, PropertyType } from './property.model';
import { Availability } from 'src/availability/availability.entity';
import { Reservation } from 'src/reservation/reservation.entity';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'building_id',
    type: 'bigint',
    nullable: false,
  })
  buildingId: number;

  @OneToOne(() => Building, (building: Building) => building.properties)
  building: Building;

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
    enum: PropertyAmenities,
    nullable: false,
  })
  amenities: PropertyAmenities[];

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
}
