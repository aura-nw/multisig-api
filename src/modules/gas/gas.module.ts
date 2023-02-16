import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gas } from './entities/gas.entity';
import { GasRepository } from './gas.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Gas])],
  controllers: [],
  providers: [GasRepository],
  exports: [GasRepository],
})
export class GasModule {}
