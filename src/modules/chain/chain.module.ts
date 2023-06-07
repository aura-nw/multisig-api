import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChainService } from './chain.service';
import { ChainController } from './chain.controller';
import { ChainRepository } from './chain.repository';
import { Chain } from './entities/chain.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chain])],
  controllers: [ChainController],
  providers: [ChainService, ChainRepository],
  exports: [ChainRepository],
})
export class ChainModule {}
