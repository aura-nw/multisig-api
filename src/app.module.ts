import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './controllers/app.controller';
import { SimulatingController } from './controllers/simulating.controller';
import { SERVICE_INTERFACE } from './module.config';
import { AppService } from './services/app.service';
import { SimulatingService } from './services/impls/simulating.service';
import { SharedModule } from './shared/shared.module';

const controllers = [
    SimulatingController,
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
    ],
})
export class AppModule { }
