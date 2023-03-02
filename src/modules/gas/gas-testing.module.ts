import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Gas } from './entities/gas.entity';
import { GasRepository } from './gas.repository';

export const gasTestingModule = Test.createTestingModule({
  imports: [],
  controllers: [],
  providers: [
    GasRepository,
    {
      provide: getRepositoryToken(Gas),
      useValue: {},
    },
  ],
});
