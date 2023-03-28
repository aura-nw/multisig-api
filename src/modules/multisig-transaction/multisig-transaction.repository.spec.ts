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

  describe('deleteTx', () => {
    it('should throw transaction not exists', async () => {
      const id = 1;

      mockRepo.createQueryBuilder = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 0,
        }),
      }));

      try {
        await multisigTransactionRepo.deleteTx(id);
      } catch (error) {
        expect(error).toEqual(new CustomError(ErrorMap.TRANSACTION_NOT_EXIST));
      }
    });

    it('should delete multisig transaction', async () => {
      const id = 1;

      mockRepo.createQueryBuilder = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 1,
        }),
      }));

      try {
        const result = await multisigTransactionRepo.deleteTx(id);
        expect(result.affected).toEqual(1);
      } catch (error) {
        expect(error).toBeNull;
      }
    });
  });

  describe('updateQueueTxToReplaced', () => {
    it('should update txs', async () => {
      const safeId = 1;
      const sequence = 0;

      mockRepo.createQueryBuilder = jest.fn(() => ({
        set: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 1,
        }),
      }));

      const result = await multisigTransactionRepo.updateQueueTxToReplaced(
        safeId,
        sequence,
      );
      expect(result.affected).toEqual(1);
    });
  });

  describe('findSequenceInQueue', () => {
    it('should sort and remove duplicate sequence', async () => {
      const safeId = 1;
      const mockFindResult = [
        {
          sequence: 3,
        },
        {
          sequence: 1,
        },
        {
          sequence: 2,
        },
        {
          sequence: 3,
        },
      ];
      const expectResult = [1, 2, 3];

      mockRepo.find = jest.fn().mockResolvedValue(mockFindResult);
      const repoSpy = jest.spyOn(repo, 'find');

      const result = await multisigTransactionRepo.findSequenceInQueue(safeId);

      expect(result).toStrictEqual(expectResult);
      expect(repoSpy).toBeCalledTimes(1);
    });
  });

  describe('updateTxBroadcastSuccess', () => {
    it('should change status of multisig transaction to PENDING', async () => {
      const transactionId = 1;
      const txHash =
        '9CBD4A5D7EEBCBBD6164B29FC7791D26F7CD623D16F2BFAE2B8E5CF905830B34';

      const mockFindResult = {
        id: transactionId,
        status: 'EXECUTING',
      };

      mockRepo.findOne = jest.fn().mockResolvedValue(mockFindResult);

      const expectArgs = {
        id: transactionId,
        status: 'PENDING',
        txHash,
      };

      mockRepo.save = jest.fn().mockResolvedValue(undefined);

      const repoSpy = jest.spyOn(repo, 'save');

      await multisigTransactionRepo.updateTxBroadcastSuccess(
        transactionId,
        txHash,
      );

      expect(repoSpy).toBeCalledTimes(1);
      expect(repoSpy).toBeCalledWith(expectArgs);
    });
  });
});
