import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuraTxRepository } from './aura-tx.repository';
import { AuraTx } from './entities/aura-tx.entity';

export const auraTxTestingModule = Test.createTestingModule({
  imports: [],
  providers: [
    AuraTxRepository,
    {
      provide: getRepositoryToken(AuraTx),
      useValue: {},
    },
  ],
});
