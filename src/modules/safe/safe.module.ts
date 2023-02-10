import { Module } from '@nestjs/common';
import { SafeService } from './safe.service';
import { SafeController } from './safe.controller';

@Module({
  controllers: [SafeController],
  providers: [SafeService]
})
export class SafeModule {}
