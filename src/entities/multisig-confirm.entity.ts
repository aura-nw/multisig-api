import { BaseEntityAutoId } from "./base/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: 'MultisigConfirm' })
export class MultisigConfirm extends BaseEntityAutoId {
    @Column({name: 'CreatedAt'})
    createdAt: Date;

    @Column({name: 'UpdatedAt'})
    updatedAt: Date;

    @Column({name: 'OwnerAddress'})
    ownerAddress: string;
 
    @Column({name: 'MultisigTransactionId'})
    multisigTransactionId: number;

    @Column({name: 'BodyBytes'})
    bodyBytes: string;

    @Column({name: 'Signature'})
    signature: string;

    @Column({name: 'ChainId'})
    chainId: string;
}