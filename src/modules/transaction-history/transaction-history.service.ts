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
}
