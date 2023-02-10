import { Module } from '@nestjs/common';
import { MultisigConfirmService } from './multisig-confirm.service';
import { MultisigConfirmController } from './multisig-confirm.controller';

@Module({
  controllers: [MultisigConfirmController],
  providers: [MultisigConfirmService]
})
export class MultisigConfirmModule {}
