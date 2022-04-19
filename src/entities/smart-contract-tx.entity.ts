import { Column, Entity } from "typeorm";
import { BaseEntityAutoId } from "./base/base.entity";

@Entity({ name: 'SmartContractTx' })
export class SmartContractTx extends BaseEntityAutoId {
    @Column({name: 'SafeId'})
    safeId: number;

    @Column({name: 'FromAddress'})
    fromAddress: string;

    @Column({name: 'ContractAddress'})
    contractAddress: string;

    @Column({name: 'Function'})
    function: string;
    
    @Column({name: 'Parameters'})
    parameters: string;

    @Column({name: 'TxHash'})
    txHash: string;

    @Column({name: 'Status'})
    status: string;

    @Column({name: 'TypeUrl'})
    typeUrl: string;

    @Column({name: 'InternalChainId'})
    internalChainId: number;

    @Column({name: 'Denom'})
    denom: string;

    @Column({name: 'AccountNumber'})
    accountNumber: number;

    @Column({name: 'Sequence'})
    sequence: string;

    @Column({name: 'Gas', type: 'float'})
    gas: number;

    @Column({name: 'Fee', type: 'float'})
    fee: number;
}