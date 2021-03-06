import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from './property.entity';

@Entity()
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'property_id',
    type: 'integer',
    nullable: false,
  })
  propertyId: number;

  @Column({
    name: 'start_date',
    type: 'date',
    nullable: false,
  })
  startDate: string;

  @Column({
    name: 'end_date',
    type: 'date',
    nullable: false,
  })
  endDate: string;

  @Column({
    name: 'is_blocked',
    default: false,
  })
  isBlocked: boolean;

  @ManyToOne(() => Property, (property: Property) => property.availabilities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
