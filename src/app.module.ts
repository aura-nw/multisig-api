import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './controllers/app.controller';
import { MultisigWalletController } from './controllers/multisig-wallet.controller';
import { SimulatingController } from './controllers/simulating.controller';
import { TransactionController } from './controllers/transaction.controller';
import { SERVICE_INTERFACE } from './module.config';
import { AppService } from './services/app.service';
import { MultisigWalletService } from './services/impls/multisig-wallet.service';
import { SimulatingService } from './services/impls/simulating.service';
import { TransactionService } from './services/impls/transaction.service';
import { SharedModule } from './shared/shared.module';

const controllers = [
    SimulatingController,
    MultisigWalletController,
    TransactionController,
    // AppController,
]
const entities = [

]
const providers = [

]
@Module({
    imports: [
        CacheModule.register({ ttl: 10000 }),
        SharedModule,
        TypeOrmModule.forFeature([...entities]),
    ],
    controllers: [...controllers],
    providers: [
        // AppService,
        //repository
        // {
        //     provide: REPOSITORY_INTERFACE.xxx,
        //     useClass: xxx
        // },
        //service
        {
            provide: SERVICE_INTERFACE.ISIMULATING_SERVICE,
            useClass: SimulatingService
        },
        {
            provide: SERVICE_INTERFACE.ITRANSACTION_SERVICE,
            useClass: TransactionService
        },
        {
            provide: SERVICE_INTERFACE.IMULTISIG_WALLET_SERVICE,
            useClass: MultisigWalletService
        },
    ],
})
export class AppModule { }
