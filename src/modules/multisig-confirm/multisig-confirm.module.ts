import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SafeOwnerModule } from '../safe-owner/safe-owner.module';
import { MultisigConfirm } from './entities/multisig-confirm.entity';
import { MultisigConfirmRepository } from './multisig-confirm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MultisigConfirm]), SafeOwnerModule],
  controllers: [],
  providers: [MultisigConfirmRepository],
  exports: [MultisigConfirmRepository],
})
export class MultisigConfirmModule {}
