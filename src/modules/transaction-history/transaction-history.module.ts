import { Module } from '@nestjs/common';
import { TransactionHistoryService } from './transaction-history.service';
import { TransactionHistoryController } from './transaction-history.controller';

@Module({
  controllers: [TransactionHistoryController],
  providers: [TransactionHistoryService]
})
export class TransactionHistoryModule {}
