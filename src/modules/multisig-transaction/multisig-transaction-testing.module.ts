import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommonService, IndexerClient, LcdClient } from '../../shared/services';
import { AuraTxRepository } from '../aura-tx/aura-tx.repository';
import { AuraTx } from '../aura-tx/entities/aura-tx.entity';
import { ChainRepository } from '../chain/chain.repository';
import { Chain } from '../chain/entities/chain.entity';
import { Message } from '../message/entities/message.entity';
import { MessageRepository } from '../message/message.repository';
import { MultisigConfirm } from '../multisig-confirm/entities/multisig-confirm.entity';
import { MultisigConfirmRepository } from '../multisig-confirm/multisig-confirm.repository';
import { Notification } from '../notification/entities/notification.entity';
import { NotificationRepository } from '../notification/notification.repository';
import { SafeOwner } from '../safe-owner/entities/safe-owner.entity';
import { SafeOwnerRepository } from '../safe-owner/safe-owner.repository';
import { Safe } from '../safe/entities/safe.entity';
import { SafeRepository } from '../safe/safe.repository';
import { SimulateService } from '../simulate';
import { TransactionHistory } from '../transaction-history/entities/transaction-history.entity';
import { TransactionHistoryRepository } from '../transaction-history/transaction-history.repository';
import { UserRepository } from '../user/user.repository';
import { MultisigTransaction } from './entities/multisig-transaction.entity';
import { MultisigTransactionController } from './multisig-transaction.controller';
import { MultisigTransactionRepository } from './multisig-transaction.repository';
import { MultisigTransactionService } from './multisig-transaction.service';

export const multisigTransactionTestingModule = Test.createTestingModule({
  imports: [],
  controllers: [MultisigTransactionController],
  providers: [
    ConfigService,
    CommonService,
    MultisigTransactionService,
    IndexerClient,
    MultisigTransactionRepository,
    AuraTxRepository,
    MultisigConfirmRepository,
    ChainRepository,
    SafeRepository,
    SafeOwnerRepository,
    MessageRepository,
    NotificationRepository,
    TransactionHistoryRepository,
    SimulateService,
    {
      provide: getRepositoryToken(MultisigTransaction),
      useValue: {},
    },
    {
      provide: getRepositoryToken(AuraTx),
      useValue: {},
    },
    {
      provide: getRepositoryToken(MultisigConfirm),
      useValue: {},
    },
    {
      provide: getRepositoryToken(Chain),
      useValue: {},
    },
    {
      provide: getRepositoryToken(Safe),
      useValue: {},
    },
    {
      provide: getRepositoryToken(SafeOwner),
      useValue: {},
    },
    {
      provide: getRepositoryToken(Message),
      useValue: {},
    },
    {
      provide: getRepositoryToken(Notification),
      useValue: {},
    },
    {
      provide: getRepositoryToken(TransactionHistory),
      useValue: {},
    },
    {
      provide: HttpService,
      useValue: {},
    },
    {
      provide: UserRepository,
      useValue: {},
    },
    {
      provide: LcdClient,
      useValue: {},
    },
  ],
});
