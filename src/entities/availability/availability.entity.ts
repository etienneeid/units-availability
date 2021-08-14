import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'property_id',
    type: 'bigint',
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
}
