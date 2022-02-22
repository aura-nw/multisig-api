import { BaseEntityAutoId } from "./base/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: 'MultisigConfirm' })
export class MultisigConfirm extends BaseEntityAutoId {
    @Column({name: 'OwnerAddress'})
    ownerAddress: string;
 
    @Column({name: 'MultisigTransactionId'})
    multisigTransactionId: number;

    @Column({name: 'BodyBytes'})
    bodyBytes: string;

    @Column({name: 'Signature'})
    signature: string;

    @Column({name: 'InternalChainId'})
    internalChainId: number;

    @Column({name: 'Status'})
    status: string;
}