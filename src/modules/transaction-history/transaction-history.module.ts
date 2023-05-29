import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuraTxModule } from '../aura-tx/aura-tx.module';
import { SafeModule } from '../safe/safe.module';
import { TransactionHistory } from './entities/transaction-history.entity';
import { TransactionHistoryRepository } from './transaction-history.repository';
import { TransactionHistoryService } from './transaction-history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionHistory]),
    AuraTxModule,
    SafeModule,
  ],
  controllers: [],
  providers: [TransactionHistoryService, TransactionHistoryRepository],
  exports: [TransactionHistoryRepository],
})
export class TransactionHistoryModule {}
