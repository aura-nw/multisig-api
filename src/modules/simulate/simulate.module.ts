import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { SafeSimulate } from './safe.simulate';
import { SimulateService } from './simulate.sevice';

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [SimulateService, SafeSimulate],
  exports: [SimulateService],
})
export class SimulateModule {}
