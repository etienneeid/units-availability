import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { City } from './building-city.enum';

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
}
