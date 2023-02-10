import { Module } from '@nestjs/common';
import { GasService } from './gas.service';
import { GasController } from './gas.controller';

@Module({
  controllers: [GasController],
  providers: [GasService]
})
export class GasModule {}
