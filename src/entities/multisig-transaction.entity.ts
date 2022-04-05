import { BaseEntityAutoId } from "./base/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: 'MultisigTransaction' })
export class MultisigTransaction extends BaseEntityAutoId {
    @Column({name: 'SafeId'})
    safeId: number;
 
    @Column({name: 'FromAddress'})
    fromAddress: string;

    @Column({name: 'ToAddress'})
    toAddress: string;

    @Column({name: 'Amount', type: 'float'})
    amount: number;

    @Column({name: 'Denom'})
    denom: string;

    @Column({name: 'Status'})
    status: string;

    @Column({name: 'TypeUrl'})
    typeUrl: string;

    @Column({name: 'InternalChainId'})
    internalChainId: number;

    @Column({name: 'AccountNumber'})
    accountNumber: number;

    @Column({name: 'Sequence'})
    sequence: string;

    @Column({name: 'Gas', type: 'float'})
    gas: number;

    @Column({name: 'Fee', type: 'float'})
    fee: number;

    @Column({name: 'TxHash'})
    txHash: string;
}