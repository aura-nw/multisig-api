import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SafeOwner } from '../safe-owner/entities/safe-owner.entity';
import { SafeOwnerRepository } from '../safe-owner/safe-owner.repository';
import { MultisigConfirm } from './entities/multisig-confirm.entity';
import { MultisigConfirmRepository } from './multisig-confirm.repository';

export const multisigConfirmTestingModule = Test.createTestingModule({
  imports: [],
  providers: [
    MultisigConfirmRepository,
    SafeOwnerRepository,
    {
      provide: getRepositoryToken(MultisigConfirm),
      useValue: {},
    },
    {
      provide: getRepositoryToken(SafeOwner),
      useValue: {},
    },
  ],
});
