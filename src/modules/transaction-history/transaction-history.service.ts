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

  async migrateTxToTxHistory() {
    const allSafeAddress = await this.safeRepo.getAllSafeAddress();

    let skip = 0;
    const take = 50;
    let batchTx = await this.auraTxRepo.getBatchTx(take, skip);

    // Using job queue to process batchTx
    while (batchTx.length > 0) {
      await Promise.all(
        batchTx.map((tx) => {
          let safeAddress = '';
          if (allSafeAddress.includes(tx.fromAddress)) {
            safeAddress = tx.fromAddress;
          }
          if (allSafeAddress.includes(tx.toAddress)) {
            safeAddress = tx.toAddress;
          }
          if (safeAddress !== '') {
            return this.txHistoryRepo.saveTxHistory(
              tx.internalChainId,
              safeAddress,
              tx.txHash,
              tx.createdAt,
            );
          }
        }),
      );

      skip += take;
      batchTx = await this.auraTxRepo.getBatchTx(take, skip);
    }
  }
}
