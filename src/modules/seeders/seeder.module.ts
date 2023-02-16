import { Module } from '@nestjs/common';
import { ChainModule } from '../chain/chain.module';
import { SeederService } from './seeder.service';

@Module({
  imports: [ChainModule],
  providers: [SeederService],
  exports: [],
})
export class SeederModule {}
