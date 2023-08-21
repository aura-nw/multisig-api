import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { StargateClient, coins, makeMultisignedTx } from '@cosmjs/stargate';
import { fromBase64 } from '@cosmjs/encoding';
import { MultisigThresholdPubkey } from '@cosmjs/amino';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MultisigTransactionRepository } from './multisig-transaction.repository';
import { ChainRepository } from '../chain/chain.repository';
import { MultisigTransaction } from './entities/multisig-transaction.entity';
import { MultisigConfirmRepository } from '../multisig-confirm/multisig-confirm.repository';

import { Chain } from '../chain/entities/chain.entity';
import { EthermintHelper } from '../../chains/ethermint/ethermint.helper';
import { SafeRepository } from '../safe/safe.repository';
import { Safe } from '../safe/entities/safe.entity';
import { TransactionStatus } from '../../common/constants/app.constant';
import { CommonUtil } from '../../utils/common.util';

type SendTx = {
  id: number;
};

@Processor('multisig-tx')
export class MultisigTxProcessor {
  private readonly logger = new Logger(MultisigTxProcessor.name);

  private ethermintHelper = new EthermintHelper();

  constructor(
    private readonly multisigRepo: MultisigTransactionRepository,
    private readonly chainRepos: ChainRepository,
    private readonly multisigConfirmRepos: MultisigConfirmRepository,
    private readonly safeRepo: SafeRepository,
  ) {}

  @Process('send-tx')
  async handleTranscode(job: Job<SendTx>) {
    this.logger.log('Start send-tx job...');
    const { id } = job.data;
    const tx = await this.multisigRepo.getMultisigTx(id);

    const chain = await this.chainRepos.findChain(tx.internalChainId);
    const safe = await this.safeRepo.getSafeByAddress(
      tx.fromAddress,
      tx.internalChainId,
    );

    // make tx
    const txBroadcast = await this.makeTx(tx, safe, chain);

    let needReplaceTx = false;

    try {
      const client = await StargateClient.connect(chain.rpc);
      const result = await client.broadcastTx(txBroadcast);
      tx.txHash = result.transactionHash;
      this.logger.log(`Broadcast tx ${tx.txHash} success`);
    } catch (error) {
      this.logger.error(error);
      const txId = CommonUtil.getStrProp(error, 'txId');
      this.logger.log(`TxHash: ${txId}`);
      if (txId === undefined) {
        tx.status = TransactionStatus.FAILED;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        tx.logs = error.message;
        safe.nextQueueSeq = await this.calculateNextSeq(
          safe.id,
          Number(tx.sequence) + 1,
        );
        await this.safeRepo.updateSafe(safe);
      } else {
        tx.txHash = txId;
      }
    }

    await this.multisigRepo.updateTx(tx);

    if (tx.txHash)
      await this.multisigRepo.updateQueueTxToReplaced(
        tx.safeId,
        Number(tx.sequence),
      );
  }

  async calculateNextSeq(
    safeId: number,
    currentSequence: number,
  ): Promise<string> {
    const queueSequences = await this.multisigRepo.findSequenceInQueue(safeId);

    let nextSeq = currentSequence;
    for (const seq of queueSequences) {
      if (seq !== nextSeq) {
        break;
      }
      nextSeq += 1;
    }
    return nextSeq.toString();
  }

  async makeTx(
    multisigTransaction: MultisigTransaction,
    safe: Safe,
    chain: Chain,
  ): Promise<Uint8Array> {
    // Get all signature of transaction
    const multisigConfirmArr =
      await this.multisigConfirmRepos.getConfirmedByTxId(
        multisigTransaction.id,
      );

    const addressSignatureMap = new Map<string, Uint8Array>();

    multisigConfirmArr.forEach((confirm) => {
      const encodeSignature = fromBase64(confirm.signature);
      addressSignatureMap.set(confirm.ownerAddress, encodeSignature);
    });

    // Fee
    const sendFee = {
      amount: coins(multisigTransaction.fee.toString(), chain.denom),
      gas: multisigTransaction.gas.toString(),
    };

    const encodedBodyBytes = fromBase64(multisigConfirmArr[0].bodyBytes);

    // Pubkey
    const safePubkey = JSON.parse(safe.safePubkey) as MultisigThresholdPubkey;

    const executeTransaction =
      chain.chainId.startsWith('evmos') || chain.chainId.startsWith('canto')
        ? this.ethermintHelper.makeMultisignedTxEthermint(
            safePubkey,
            Number(multisigTransaction.sequence),
            sendFee,
            encodedBodyBytes,
            addressSignatureMap,
          )
        : makeMultisignedTx(
            safePubkey,
            Number(multisigTransaction.sequence),
            sendFee,
            encodedBodyBytes,
            addressSignatureMap,
          );

    const encodeTransaction = Uint8Array.from(
      TxRaw.encode(executeTransaction).finish(),
    );
    return encodeTransaction;
  }
}
