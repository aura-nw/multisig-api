import { Module } from '@nestjs/common';
import { ChainService } from './chain.service';
import { ChainController } from './chain.controller';

@Module({
  controllers: [ChainController],
  providers: [ChainService]
})
export class ChainModule {}
