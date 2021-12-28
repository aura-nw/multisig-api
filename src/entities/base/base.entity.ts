import { CreateDateColumn, PrimaryColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn } from "typeorm";

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

    @Column({ name: 'CreateBy' })
    createBy: string;

    @Column({ name: 'UpdateBy' })
    updateBy: string;
}
export class BaseEntityId extends BaseEntity {
    @PrimaryColumn({ name: 'Id' })
    id: string;
}
export class BaseEntityAutoId extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { name: 'Id' })
    id: number;
}