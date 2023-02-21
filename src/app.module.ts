import { CacheModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedModule } from './shared/shared.module';
import { ConfigService } from './shared/services/config.service';
import { contextMiddleware } from './middlewares';
import { SeederModule } from './modules/seeders/seeder.module';
import { AuthModule } from './modules/auth/auth.module';
import { SafeModule } from './modules/safe/safe.module';
import { ChainModule } from './modules/chain/chain.module';
import { DistributionModule } from './modules/distribution/distribution.module';
import { GovModule } from './modules/gov/gov.module';
import { MultisigTransactionModule } from './modules/multisig-transaction/multisig-transaction.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SafeOwnerModule } from './modules/safe-owner/safe-owner.module';
import { UserModule } from './modules/user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { NotifyProposalModule } from './modules/jobs/notify-proposal.module';
import { NestModule } from '@nestjs/common';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    CacheModule.register({ ttl: 10_000 }),
    SharedModule,
    SeederModule,
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ConfigService) => configService.typeOrmConfig,
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    ChainModule,
    SafeModule,
    MultisigTransactionModule,
    DistributionModule,
    GovModule,
    NotificationModule,
    SafeOwnerModule,
    UserModule,
    NotifyProposalModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer.apply(contextMiddleware).forRoutes('*');
  }
}
