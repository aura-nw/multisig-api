import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity {
  @CreateDateColumn({
    type: 'timestamp',
    name: 'CreatedAt',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'UpdatedAt',
  })
  updatedAt: Date;
}
