import { Column, Entity } from 'typeorm';
import { BaseEntityAutoId } from '../../../common/base.entity';

@Entity({ name: 'MultisigConfirm' })
export class MultisigConfirm extends BaseEntityAutoId {
  @Column({ name: 'OwnerAddress' })
  ownerAddress: string;

  @Column({ name: 'MultisigTransactionId' })
  multisigTransactionId: number;

  @Column({ name: 'SmartContractTxId' })
  smartContractTxId: number;

  @Column({ name: 'BodyBytes' })
  bodyBytes: string;

  @Column({ name: 'Signature' })
  signature: string;

  @Column({ name: 'InternalChainId' })
  internalChainId: number;

  @Column({ name: 'Status' })
  status: string;
}
