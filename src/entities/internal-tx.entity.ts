import { BaseEntityAutoId } from "./base/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: 'InternalTx' })
export class InternalTx extends BaseEntityAutoId {
    @Column({name: 'Sequence'})
    sequence: string;
 
    @Column({name: 'Gas'})
    gas: number;

    @Column({name: 'GasAmount'})
    gasAmount: number;

    @Column({name: 'Signature'})
    signature: string;

    @Column({name: 'ChainId'})
    chainId: string;
}