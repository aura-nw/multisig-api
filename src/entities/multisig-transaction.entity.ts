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

    @Column({name: 'Signature'})
    signature: string;

    @Column({name: 'ChainId'})
    chainId: string;

    @Column({name: 'Gas', type: 'float'})
    gas: number;

    @Column({name: 'GasAmount', type: 'float'})
    gasAmount: number;

    @Column({name: 'MultisigPubkey'})
    multisigPubkey: string;

    @Column({name: 'AuraTxId'})
    auraTxId: number;

    @Column({name: 'BodyBytes'})
    bodyBytes: string;

    @Column({name: 'Map'})
    map: string;
}