import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChainService } from './chain.service';
import { ChainController } from './chain.controller';
import { ChainRepository } from './chain.repository';
import { Chain } from './entities/chain.entity';
import { GasModule } from '../gas/gas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chain]), GasModule],
  controllers: [ChainController],
  providers: [ChainService, ChainRepository],
  exports: [ChainRepository],
})
export class ChainModule {}
