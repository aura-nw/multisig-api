import { Module } from '@nestjs/common';
import { MultisigTransactionService } from './multisig-transaction.service';
import { MultisigTransactionController } from './multisig-transaction.controller';

@Module({
  controllers: [MultisigTransactionController],
  providers: [MultisigTransactionService]
})
export class MultisigTransactionModule {}
