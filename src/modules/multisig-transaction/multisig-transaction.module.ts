import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { MultisigTransactionService } from './multisig-transaction.service';
import { MultisigTransactionController } from './multisig-transaction.controller';
import { MultisigTransactionRepository } from './multisig-transaction.repository';
import { MultisigTransaction } from './entities/multisig-transaction.entity';
import { AuraTxModule } from '../aura-tx/aura-tx.module';
import { MultisigConfirmModule } from '../multisig-confirm/multisig-confirm.module';
import { ChainModule } from '../chain/chain.module';
import { SafeModule } from '../safe/safe.module';
import { SafeOwnerModule } from '../safe-owner/safe-owner.module';
import { MessageModule } from '../message/message.module';
import { NotificationModule } from '../notification/notification.module';
import { TransactionHistoryModule } from '../transaction-history/transaction-history.module';
import { SimulateModule } from '../simulate/simulate.module';
import { MultisigTxProcessor } from './multisig-transaction.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'multisig-tx',
    }),
    TypeOrmModule.forFeature([MultisigTransaction]),
    AuraTxModule,
    MultisigConfirmModule,
    ChainModule,
    SafeModule,
    SafeOwnerModule,
    MessageModule,
    NotificationModule,
    TransactionHistoryModule,
    SimulateModule,
  ],
  controllers: [MultisigTransactionController],
  providers: [
    MultisigTransactionService,
    MultisigTransactionRepository,
    MultisigTxProcessor,
  ],
  exports: [MultisigTransactionRepository],
})
export class MultisigTransactionModule {}
