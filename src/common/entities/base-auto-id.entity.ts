import { PrimaryColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

export class BaseEntityId extends BaseEntity {
  @PrimaryColumn({ name: 'Id' })
  id: string;
}
