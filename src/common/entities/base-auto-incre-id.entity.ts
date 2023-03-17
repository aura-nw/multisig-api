import { PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

export class BaseEntityAutoId extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'Id' })
  id: number;
}
