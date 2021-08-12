import { Property } from 'src/property/property.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'check_in ',
    type: 'date',
    nullable: false,
  })
  checkIn: string;

  @Column({
    name: 'check_out ',
    type: 'date',
    nullable: false,
  })
  checkOut: string;

  @Column({
    name: 'property_id',
    type: 'bigint',
    nullable: false,
  })
  propertyId: number;

  @OneToOne(() => Property, (property: Property) => property.reservations)
  property: Property;
}
