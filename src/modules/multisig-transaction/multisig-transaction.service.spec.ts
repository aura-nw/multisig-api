import { Test, TestingModule } from '@nestjs/testing';
import { MultisigTransactionService } from './multisig-transaction.service';

describe('MultisigTransactionService', () => {
  let service: MultisigTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MultisigTransactionService],
    }).compile();

    service = module.get<MultisigTransactionService>(MultisigTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
