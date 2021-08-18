import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from './property.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'check_in',
    type: 'date',
    nullable: false,
  })
  checkIn: string;

  @Column({
    name: 'check_out',
    type: 'date',
    nullable: false,
  })
  checkOut: string;

  @Column({
    name: 'property_id',
    type: 'integer',
    nullable: false,
  })
  propertyId: number;

  @ManyToOne(() => Property, (property: Property) => property.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
