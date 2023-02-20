import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SafeService } from './safe.service';
import { SafeController } from './safe.controller';
import { Safe } from './entities/safe.entity';
import { SafeOwnerModule } from '../safe-owner/safe-owner.module';
import { ChainModule } from '../chain/chain.module';
import { NotificationModule } from '../notification/notification.module';
import { SafeRepository } from './safe.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Safe]),
    SafeOwnerModule,
    ChainModule,
    NotificationModule,
  ],
  controllers: [SafeController],
  providers: [SafeService, SafeRepository],
  exports: [SafeRepository],
})
export class SafeModule {}
