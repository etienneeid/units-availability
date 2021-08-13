import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PropertyAmenities } from './property-amenities.enum';
import { PropertyType } from './property-type.enum';

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
}
