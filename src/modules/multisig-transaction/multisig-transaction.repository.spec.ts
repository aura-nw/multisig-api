import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { MockFactory } from '../../common/mock';
import { MultisigTransactionRepository } from './multisig-transaction.repository';
import { MultisigTransaction } from './entities/multisig-transaction.entity';
import { MultisigConfirmRepository } from '../multisig-confirm/multisig-confirm.repository';
import { SafeRepository } from '../safe/safe.repository';
import { multisigTransactionTestingModule } from './multisig-transaction-testing.module';

describe('MultisigTransactionRepository', () => {
  let multisigTransactionRepo: MultisigTransactionRepository;
  let multisigConfirmRepo: MultisigConfirmRepository;
  let safeRepo: SafeRepository;
  let mockRepo = MockFactory.getMock<Repository<MultisigTransaction>>();

  beforeEach(async () => {
    const module: TestingModule = await multisigTransactionTestingModule
      .overrideProvider(getRepositoryToken(MultisigTransaction))
      .useValue(mockRepo)
      .compile();

    multisigTransactionRepo = module.get<MultisigTransactionRepository>(
      MultisigTransactionRepository,
    );
    multisigConfirmRepo = module.get<MultisigConfirmRepository>(
      MultisigConfirmRepository,
    );
    safeRepo = module.get<SafeRepository>(SafeRepository);
  });

  it('should be defined', () => {
    expect(multisigTransactionRepo).toBeDefined();
  });

  // describe('getMultisigTx', () => {
  //   it('should return detail of multisig transaction', async () => {
  //     const multisigTransactionId = 1;

  //     const expected = plainToInstance(MultisigConfirm, []);
  //     mockRepo.find = jest.fn().mockReturnValue([]);

  //     expect(
  //       await multisigConfirmRepository.getConfirmedByTxId(
  //         multisigTransactionId,
  //       ),
  //     ).toStrictEqual(expected);
  //   });
  // });
});
