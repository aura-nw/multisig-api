import { Module } from '@nestjs/common';
import { AuraTxService } from './aura-tx.service';
import { AuraTxController } from './aura-tx.controller';

@Module({
  controllers: [AuraTxController],
  providers: [AuraTxService]
})
export class AuraTxModule {}
