import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chain } from '../../entities';
import { ChainSeederService } from './chain/chain-seeder.service';
import { SeederService } from './seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Chain])],
  providers: [SeederService, ChainSeederService],
  exports: [SeederService, ChainSeederService],
})
export class SeederModule {}
