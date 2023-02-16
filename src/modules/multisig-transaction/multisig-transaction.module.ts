import { Module } from '@nestjs/common';
import { MultisigTransactionService } from './multisig-transaction.service';
import { MultisigTransactionController } from './multisig-transaction.controller';
import { MultisigTransactionRepository } from './multisig-transaction.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MultisigTransaction } from './entities/multisig-transaction.entity';
import { AuraTxModule } from '../aura-tx/aura-tx.module';
import { MultisigConfirmModule } from '../multisig-confirm/multisig-confirm.module';
import { ChainModule } from '../chain/chain.module';
import { SafeModule } from '../safe/safe.module';
import { SafeOwnerModule } from '../safe-owner/safe-owner.module';
import { MessageModule } from '../message/message.module';
import { NotificationModule } from '../notification/notification.module';
import { TransactionHistoryModule } from '../transaction-history/transaction-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MultisigTransaction]),
    AuraTxModule,
    MultisigConfirmModule,
    ChainModule,
    SafeModule,
    SafeOwnerModule,
    MessageModule,
    NotificationModule,
    TransactionHistoryModule,
  ],
  controllers: [MultisigTransactionController],
  providers: [MultisigTransactionService, MultisigTransactionRepository],
  exports: [MultisigTransactionRepository],
})
export class MultisigTransactionModule {}
