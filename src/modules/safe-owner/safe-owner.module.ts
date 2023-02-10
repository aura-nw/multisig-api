import { Module } from '@nestjs/common';
import { SafeOwnerService } from './safe-owner.service';
import { SafeOwnerController } from './safe-owner.controller';

@Module({
  controllers: [SafeOwnerController],
  providers: [SafeOwnerService]
})
export class SafeOwnerModule {}
