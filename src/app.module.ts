import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MultisigWalletController } from './controllers/multisig-wallet.controller';
import { SimulatingController } from './controllers/simulating.controller';
import { TransactionController } from './controllers/transaction.controller';
import { OwnerController } from './controllers/owner.controller';
import { NotificationController } from './controllers/notification.controller';
import {
  ENTITIES_CONFIG,
  REPOSITORY_INTERFACE,
  SERVICE_INTERFACE,
} from './module.config';
import { MultisigWalletService } from './services/impls/multisig-wallet.service';
import { SimulatingService } from './services/impls/simulating.service';
import { TransactionService } from './services/impls/transaction.service';
import { SharedModule } from './shared/shared.module';
import { ConfigService } from './shared/services/config.service';
import { MultisigWalletRepository } from './repositories/impls/multisig-wallet.repository';
import { MultisigWalletOwnerRepository } from './repositories/impls/multisig-wallet-owner.repository';
import { MultisigTransactionRepository } from './repositories/impls/multisig-transaction.repository';
import { MultisigConfirmRepository } from './repositories/impls/multisig-confirm.repository';
import { GeneralService } from './services/impls/general.service';
import { GeneralController } from './controllers/general.controller';
import { GeneralRepository } from './repositories/impls/general.repository';
import { TransactionRepository } from './repositories/impls/transaction.repository';

const controllers = [
  SimulatingController,
  MultisigWalletController,
  TransactionController,
  OwnerController,
  NotificationController,
  GeneralController,
  // AppController,
];
const entities = [
  ENTITIES_CONFIG.SAFE, 
  ENTITIES_CONFIG.SAFE_OWNER, 
  ENTITIES_CONFIG.CHAIN,
  ENTITIES_CONFIG.MULTISIG_CONFIRM,
  ENTITIES_CONFIG.MULTISIG_TRANSACTION,
];
@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5
      })
    }),
    CacheModule.register({ ttl: 10000 }),
    SharedModule,
    TypeOrmModule.forFeature([...entities]),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ConfigService) => configService.typeOrmConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [...controllers],
  providers: [
    //repository
    {
      provide: REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY,
      useClass: MultisigWalletRepository,
    },
    {
      provide: REPOSITORY_INTERFACE.IMULTISIG_WALLET_OWNER_REPOSITORY,
      useClass: MultisigWalletOwnerRepository,
    },
    {
      provide: REPOSITORY_INTERFACE.IMULTISIG_TRANSACTION_REPOSITORY,
      useClass: MultisigTransactionRepository,
    },
    {
      provide: REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY,
      useClass: MultisigConfirmRepository
    },
    {
      provide: REPOSITORY_INTERFACE.IGENERAL_REPOSITORY,
      useClass: GeneralRepository,
    },
    {
      provide: REPOSITORY_INTERFACE.ITRANSACTION_REPOSITORY,
      useClass: TransactionRepository,
    },
    //service
    {
      provide: SERVICE_INTERFACE.ISIMULATING_SERVICE,
      useClass: SimulatingService,
    },
    {
      provide: SERVICE_INTERFACE.ITRANSACTION_SERVICE,
      useClass: TransactionService,
    },
    {
      provide: SERVICE_INTERFACE.IMULTISIG_WALLET_SERVICE,
      useClass: MultisigWalletService,
    },
    {
      provide: SERVICE_INTERFACE.IGENERAL_SERVICE,
      useClass: GeneralService,
    },
  ],
})
export class AppModule {}
