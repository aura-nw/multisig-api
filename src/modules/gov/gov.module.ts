import { Module } from '@nestjs/common';
import { GovService } from './gov.service';
import { GovController } from './gov.controller';

@Module({
  controllers: [GovController],
  providers: [GovService]
})
export class GovModule {}
