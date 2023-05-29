import { Injectable, Logger } from '@nestjs/common';
import { SafeRepository } from '../safe/safe.repository';
import { TransactionHistoryRepository } from './transaction-history.repository';
import { AuraTxRepository } from '../aura-tx/aura-tx.repository';

@Injectable()
export class TransactionHistoryService {
  private readonly logger = new Logger(TransactionHistoryService.name);

  constructor(
    private safeRepo: SafeRepository,
    private txHistoryRepo: TransactionHistoryRepository,
    private auraTxRepo: AuraTxRepository,
  ) {
    this.logger.log(
      '============== Constructor Transaction Service ==============',
    );
  }

  async migrateTxToTxHistory(skip = 0, take = 50): Promise<void> {
    const allSafeAddress = await this.safeRepo.getAllSafeAddress();

    const batchTx = await this.auraTxRepo.getBatchTx(take, skip);

    // Using job queue to process batchTx
    if (batchTx.length > 0) {
      const promises = [];

      batchTx.forEach((tx) => {
        let safeAddress = '';
        if (allSafeAddress.includes(tx.fromAddress)) {
          safeAddress = tx.fromAddress;
        }
        if (allSafeAddress.includes(tx.toAddress)) {
          safeAddress = tx.toAddress;
        }
        if (safeAddress !== '') {
          promises.push(
            this.txHistoryRepo.saveTxHistory(
              tx.internalChainId,
              safeAddress,
              tx.txHash,
              tx.createdAt,
            ),
          );
        }
      });

      await Promise.all(promises);

      const result = await this.auraTxRepo.getBatchTx(take, skip + take);
      batchTx.push(...result);
    }
  }
}
