import { CacheModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MultisigWalletController } from './controllers/multisig-wallet.controller';
import { TransactionController } from './controllers/transaction.controller';
import { OwnerController } from './controllers/owner.controller';
import {
  ENTITIES_CONFIG,
  REPOSITORY_INTERFACE,
  SERVICE_INTERFACE,
} from './module.config';
import { MultisigWalletService } from './services/impls/multisig-wallet.service';
import { MultisigTransactionService } from './services/impls/multisig-transaction.service';
import { SharedModule } from './shared/shared.module';
import { GeneralService } from './services/impls/general.service';
import { ConfigService } from './shared/services/config.service';
import { MultisigWalletRepository } from './repositories/impls/multisig-wallet.repository';
import { MultisigWalletOwnerRepository } from './repositories/impls/multisig-wallet-owner.repository';
import { GeneralController } from './controllers/general.controller';
import { GeneralRepository } from './repositories/impls/general.repository';
import { MultisigTransactionRepository } from './repositories/impls/multisig-transaction.repository';
import { MultisigConfirmRepository } from './repositories/impls/multisig-confirm.repository';
import { TransactionRepository } from './repositories/impls/transaction.repository';
import { TransactionService } from './services/impls/transaction.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/impls/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { contextMiddleware } from './middlewares';
import { SeederModule } from './database/seeders/seeder.module';
import { GasRepository } from './repositories/impls/gas.repository';
import { GovService } from './services/impls/gov.service';
import { GovController } from './controllers/gov.controller';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './repositories/impls/user.repository';
import { UserService } from './services/impls/user.service';

const controllers = [
  MultisigWalletController,
  TransactionController,
  OwnerController,
  GeneralController,
  AuthController,
  GovController,
  UserController,
  // AppController,
];
const entities = [
  ENTITIES_CONFIG.SAFE,
  ENTITIES_CONFIG.SAFE_OWNER,
  ENTITIES_CONFIG.CHAIN,
  ENTITIES_CONFIG.MULTISIG_CONFIRM,
  ENTITIES_CONFIG.MULTISIG_TRANSACTION,
  ENTITIES_CONFIG.AURA_TX,
  ENTITIES_CONFIG.GAS,
  ENTITIES_CONFIG.USER,
];
@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    CacheModule.register({ ttl: 10000 }),
    SharedModule,
    SeederModule,
    TypeOrmModule.forFeature([...entities]),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ConfigService) => configService.typeOrmConfig,
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [SharedModule],
      useFactory: (configService: ConfigService) => configService.jwtConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [...controllers],
  providers: [
    //jwt
    JwtStrategy,
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
      provide: REPOSITORY_INTERFACE.IGENERAL_REPOSITORY,
      useClass: GeneralRepository,
    },
    {
      provide: REPOSITORY_INTERFACE.IMULTISIG_TRANSACTION_REPOSITORY,
      useClass: MultisigTransactionRepository,
    },
    {
      provide: REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY,
      useClass: MultisigConfirmRepository,
    },
    {
      provide: REPOSITORY_INTERFACE.ITRANSACTION_REPOSITORY,
      useClass: TransactionRepository,
    },
    {
      provide: REPOSITORY_INTERFACE.IGAS_REPOSITORY,
      useClass: GasRepository,
    },
    {
      provide: REPOSITORY_INTERFACE.IUSER_REPOSITORY,
      useClass: UserRepository,
    },
    //service
    {
      provide: SERVICE_INTERFACE.IMULTISIG_TRANSACTION_SERVICE,
      useClass: MultisigTransactionService,
    },
    {
      provide: SERVICE_INTERFACE.IMULTISIG_WALLET_SERVICE,
      useClass: MultisigWalletService,
    },
    {
      provide: SERVICE_INTERFACE.IGENERAL_SERVICE,
      useClass: GeneralService,
    },
    {
      provide: SERVICE_INTERFACE.ITRANSACTION_SERVICE,
      useClass: TransactionService,
    },
    {
      provide: SERVICE_INTERFACE.IAUTH_SERVICE,
      useClass: AuthService,
    },
    {
      provide: SERVICE_INTERFACE.IGOV_SERVICE,
      useClass: GovService,
    },
    {
      provide: SERVICE_INTERFACE.IUSER_SERVICE,
      useClass: UserService,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer.apply(contextMiddleware).forRoutes('*');
  }
}
