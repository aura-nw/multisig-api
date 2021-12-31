import { CacheModule, Module } from '@nestjs/common';
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
import { AuthenticationRepository } from './repositories/impls/safe.repository';

const controllers = [
  SimulatingController,
  MultisigWalletController,
  TransactionController,
  OwnerController,
  NotificationController,
  // AppController,
];
const entities = [ENTITIES_CONFIG.SAFE];
@Module({
  imports: [
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
      provide: REPOSITORY_INTERFACE.ISAFE_REPOSITORY,
      useClass: AuthenticationRepository,
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
  ],
})
export class AppModule { }
