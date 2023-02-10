import { Module } from '@nestjs/common';
import { DistributionService } from './distribution.service';
import { DistributionController } from './distribution.controller';

@Module({
  controllers: [DistributionController],
  providers: [DistributionService]
})
export class DistributionModule {}
