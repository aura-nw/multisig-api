import { CacheModule, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { SharedModule } from './shared/shared.module';
import { SeederModule } from './modules/seeders/seeder.module';
import { AuthModule } from './modules/auth/auth.module';
import { SafeModule } from './modules/safe/safe.module';
import { ChainModule } from './modules/chain/chain.module';
import { MultisigTransactionModule } from './modules/multisig-transaction/multisig-transaction.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SafeOwnerModule } from './modules/safe-owner/safe-owner.module';
import { UserModule } from './modules/user/user.module';
import { JwtStrategy } from './modules/auth/jwt.strategy';
import { NotifyProposalModule } from './modules/jobs/notify-proposal.module';
import { CustomConfigService } from './shared/services/custom-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),

    CacheModule.register({ ttl: 10_000 }),
    SharedModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_URL'),
          port: configService.get('REDIS_PORT'),
          db: configService.get('REDIS_DB'),
        },
      }),
      inject: [ConfigService],
    }),
    SeederModule,
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (customConfigService: CustomConfigService) =>
        customConfigService.typeOrmConfig,
      inject: [CustomConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    ChainModule,
    SafeModule,
    MultisigTransactionModule,
    NotificationModule,
    SafeOwnerModule,
    UserModule,
    NotifyProposalModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
