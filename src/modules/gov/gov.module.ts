import { Module } from '@nestjs/common';
import { GovService } from './gov.service';
import { GovController } from './gov.controller';
import { ChainModule } from '../chain/chain.module';

@Module({
  imports: [ChainModule],
  controllers: [GovController],
  providers: [GovService],
})
export class GovModule {}
