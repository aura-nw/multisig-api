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
import { CustomError } from '../../common/custom-error';
import { ErrorMap } from '../../common/error.map';

describe('MultisigTransactionRepository', () => {
  let multisigTransactionRepo: MultisigTransactionRepository;
  let multisigConfirmRepo: MultisigConfirmRepository;
  let safeRepo: SafeRepository;
  let mockRepo = MockFactory.getMock<Repository<MultisigTransaction>>();
  let repo: Repository<MultisigTransaction>;

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
    repo = module.get<Repository<MultisigTransaction>>(
      getRepositoryToken(MultisigTransaction),
    );
  });

  it('should be defined', () => {
    expect(multisigTransactionRepo).toBeDefined();
  });

  describe('getMultisigTx', () => {
    it('should return detail of multisig transaction', async () => {
      const multisigTransactionId = 1;

      const expected = plainToInstance(MultisigTransaction, {});

      mockRepo.findOne = jest.fn().mockReturnValue({});

      const repoSpy = jest.spyOn(repo, 'findOne');
      expect(
        multisigTransactionRepo.getMultisigTx(multisigTransactionId),
      ).resolves.toEqual(expected);

      expect(repoSpy).toBeCalledTimes(1);
    });

    it('should throw error if multisig transaction not found', async () => {
      const multisigTransactionId = -1;
      mockRepo.findOne = jest.fn().mockReturnValue(undefined);

      const repoSpy = jest.spyOn(repo, 'findOne');
      try {
        await multisigTransactionRepo.getMultisigTx(multisigTransactionId);
      } catch (error) {
        expect(error).toEqual(new CustomError(ErrorMap.TRANSACTION_NOT_EXIST));
      }

      expect(repoSpy).toBeCalledTimes(1);
      expect(repoSpy).toBeCalledWith({
        where: {
          id: multisigTransactionId,
        },
      });
    });
  });

  describe('cancelTx', () => {
    it('should change status of multisig transaction to CANCEL', async () => {
      const multisigTransaction = plainToInstance(MultisigTransaction, {
        id: 1,
        status: 'PENDING',
      });

      const expectArgs = {
        id: multisigTransaction.id,
        status: 'CANCELLED',
      };

      mockRepo.save = jest.fn().mockResolvedValue(undefined);

      const repoSpy = jest.spyOn(repo, 'save');

      await multisigTransactionRepo.cancelTx(multisigTransaction);

      expect(repoSpy).toBeCalledTimes(1);
      expect(repoSpy).toBeCalledWith(expectArgs);
    });
  });

  describe('updateFailedTx', () => {
    it('should change status of multisig transaction to FAILED', async () => {
      const multisigTransaction = plainToInstance(MultisigTransaction, {
        id: 1,
        status: 'PENDING',
      });

      const expectArgs = {
        id: multisigTransaction.id,
        status: 'FAILED',
      };

      mockRepo.save = jest.fn().mockResolvedValue(undefined);

      const repoSpy = jest.spyOn(repo, 'save');

      await multisigTransactionRepo.updateFailedTx(multisigTransaction);

      expect(repoSpy).toBeCalledTimes(1);
      expect(repoSpy).toBeCalledWith(expectArgs);
    });
  });
});
