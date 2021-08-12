import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Property } from 'src/property/property.entity';

@Entity()
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Property, (property: Property) => property.id)
  @Column({
    name: 'property_id',
    type: 'bigint',
    nullable: false,
  })
  propertyId: number;

  @ManyToOne(() => Property, (property: Property) => property.availabilities)
  property: Property;

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
}
