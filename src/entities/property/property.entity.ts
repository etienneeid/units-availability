import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Amenities } from '../../enums/amenities.enum';
import { PropertyType } from '../../enums/property-type.enum';

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
    enum: Amenities,
    nullable: false,
  })
  amenities: Amenities[];
}
