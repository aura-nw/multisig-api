import { Test, TestingModule } from '@nestjs/testing';
import { TransactionHistoryController } from './transaction-history.controller';
import { TransactionHistoryService } from './transaction-history.service';

describe('TransactionHistoryController', () => {
  let controller: TransactionHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionHistoryController],
      providers: [TransactionHistoryService],
    }).compile();

    controller = module.get<TransactionHistoryController>(TransactionHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
