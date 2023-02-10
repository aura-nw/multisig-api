import { Test, TestingModule } from '@nestjs/testing';
import { MultisigTransactionController } from './multisig-transaction.controller';
import { MultisigTransactionService } from './multisig-transaction.service';

describe('MultisigTransactionController', () => {
  let controller: MultisigTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MultisigTransactionController],
      providers: [MultisigTransactionService],
    }).compile();

    controller = module.get<MultisigTransactionController>(MultisigTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
