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
import { TransactionStatus } from '../../common/constants/app.constant';
import { safeDbMock, txConfirmDbMock } from '../../mock';
import { GetListConfirmResDto } from '../multisig-confirm/dto';
import { Safe } from '../safe/entities/safe.entity';
import { getMultisigDetailResponseMock } from './mocks';

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

  describe('getBroadcastableTx', () => {
    it('should return broadcastable tx', async () => {
      const txId = 1;
      const mockFindResult = {
        id: txId,
        status: 'AWAITING_EXECUTION',
      };
      mockRepo.findOne = jest.fn().mockResolvedValue(mockFindResult);
      const repoSpy = jest.spyOn(repo, 'findOne');

      const result = await multisigTransactionRepo.getBroadcastableTx(txId);
      expect(result).toStrictEqual(mockFindResult);
      expect(repoSpy).toBeCalledTimes(1);
    });

    it('should throw transaction not valid', async () => {
      const txId = 1;
      const mockFindResult = {
        id: txId,
        status: 'PENDING',
      };
      mockRepo.findOne = jest.fn().mockResolvedValue(mockFindResult);
      const repoSpy = jest.spyOn(repo, 'findOne');

      try {
        await multisigTransactionRepo.getBroadcastableTx(txId);
      } catch (error) {
        expect(error).toEqual(new CustomError(ErrorMap.TRANSACTION_NOT_VALID));
      }

      expect(repoSpy).toBeCalledTimes(1);
    });
  });

  describe('updateExecutingTx', () => {
    it('should change status of multisig transaction to PENDING', async () => {
      const transactionId = 1;
      const status = TransactionStatus.PENDING;
      const txHash =
        '9CBD4A5D7EEBCBBD6164B29FC7791D26F7CD623D16F2BFAE2B8E5CF905830B34';

      mockRepo.update = jest.fn().mockResolvedValue({
        affected: 1,
      });

      const repoSpy = jest.spyOn(repo, 'update');
      await multisigTransactionRepo.updateExecutingTx(
        transactionId,
        status,
        txHash,
      );
      expect(repoSpy).toBeCalledTimes(1);
    });

    it('should throw transaction not valid', async () => {
      const transactionId = 1;
      const status = TransactionStatus.PENDING;
      const txHash =
        '9CBD4A5D7EEBCBBD6164B29FC7791D26F7CD623D16F2BFAE2B8E5CF905830B34';

      mockRepo.update = jest.fn().mockResolvedValue({
        affected: 0,
      });

      const repoSpy = jest.spyOn(repo, 'update');
      try {
        await multisigTransactionRepo.updateExecutingTx(
          transactionId,
          status,
          txHash,
        );
      } catch (error) {
        expect(error).toEqual(new CustomError(ErrorMap.TRANSACTION_NOT_VALID));
      }
      expect(repoSpy).toBeCalledTimes(1);
    });
  });

  describe('getTransactionById', () => {
    it('should get multisig transaction by id', async () => {
      const id = 1;
      const mockFindResult = {
        id,
      };
      mockRepo.findOne = jest.fn().mockResolvedValue(mockFindResult);
      const repoSpy = jest.spyOn(repo, 'findOne');

      const result = await multisigTransactionRepo.getTransactionById(id);
      expect(result).toStrictEqual(mockFindResult);
      expect(repoSpy).toBeCalledTimes(1);
    });

    it('should throw transaction not found', async () => {
      const id = 1;
      mockRepo.findOne = jest.fn().mockResolvedValue(null);
      const repoSpy = jest.spyOn(repo, 'findOne');

      try {
        await multisigTransactionRepo.getTransactionById(id);
      } catch (error) {
        expect(error).toEqual(new CustomError(ErrorMap.TRANSACTION_NOT_EXIST));
      }

      expect(repoSpy).toBeCalledTimes(1);
    });
  });

  describe('insertMultisigTransaction', () => {
    it('should insert multisig transaction', async () => {
      const tx = plainToInstance(MultisigTransaction, {
        id: 1,
      });

      mockRepo.save = jest.fn().mockResolvedValue(tx);
      const repoSpy = jest.spyOn(repo, 'save');

      const result = await multisigTransactionRepo.insertMultisigTransaction(
        tx,
      );
      expect(result).toStrictEqual(tx);
      expect(repoSpy).toBeCalledTimes(1);
    });

    it('should throw insert transaction failed', async () => {
      const tx = plainToInstance(MultisigTransaction, {
        id: 1,
      });

      mockRepo.save = jest.fn().mockResolvedValue(null);
      const repoSpy = jest.spyOn(repo, 'save');

      try {
        await multisigTransactionRepo.insertMultisigTransaction(tx);
      } catch (error) {
        expect(error).toEqual(
          new CustomError(ErrorMap.INSERT_TRANSACTION_FAILED),
        );
      }

      expect(repoSpy).toBeCalledTimes(1);
    });
  });

  describe('updateAwaitingExecutionTx', () => {
    it('should update awaiting execution tx', async () => {
      const txId = 1;
      const safeId = 1;
      const threshold = 2;

      const mockFindTxResult = {
        id: 1,
        status: TransactionStatus.AWAITING_CONFIRMATIONS,
      };

      const expectResult = {
        id: 1,
        status: TransactionStatus.AWAITING_EXECUTION,
      };

      mockRepo.findOne = jest.fn().mockResolvedValue(mockFindTxResult);
      mockRepo.save = jest.fn().mockResolvedValue(expectResult);
      jest
        .spyOn(multisigConfirmRepo, 'getListConfirmMultisigTransaction')
        .mockResolvedValue(
          plainToInstance(
            GetListConfirmResDto,
            txConfirmDbMock.slice(0, threshold),
          ),
        );
      jest.spyOn(safeRepo, 'getSafeById').mockResolvedValue(
        plainToInstance(
          Safe,
          safeDbMock.find((safe) => safe.threshold === threshold),
        ),
      );

      const repoSpy = jest.spyOn(repo, 'findOne');
      const saveSpy = jest.spyOn(repo, 'save');

      const result = await multisigTransactionRepo.updateAwaitingExecutionTx(
        txId,
        safeId,
      );

      expect(result).toStrictEqual(expectResult);
      expect(repoSpy).toBeCalledTimes(1);
      expect(saveSpy).toBeCalledTimes(1);
      expect(saveSpy).toBeCalledWith(expectResult);
    });

    it('should return undefined if tx not ready to execute', async () => {
      const txId = 1;
      const safeId = 1;
      const threshold = 2;
      const totalConfirm = 1;

      jest
        .spyOn(multisigConfirmRepo, 'getListConfirmMultisigTransaction')
        .mockResolvedValue(
          plainToInstance(
            GetListConfirmResDto,
            txConfirmDbMock.slice(0, totalConfirm),
          ),
        );
      jest.spyOn(safeRepo, 'getSafeById').mockResolvedValue(
        plainToInstance(
          Safe,
          safeDbMock.find((safe) => safe.threshold === threshold),
        ),
      );

      const result = await multisigTransactionRepo.updateAwaitingExecutionTx(
        txId,
        safeId,
      );

      expect(result).toBeUndefined();
    });

    it('should throw transaction not exist', async () => {
      const txId = 1;
      const safeId = 1;
      const threshold = 2;
      const totalConfirm = 2;

      jest
        .spyOn(multisigConfirmRepo, 'getListConfirmMultisigTransaction')
        .mockResolvedValue(
          plainToInstance(
            GetListConfirmResDto,
            txConfirmDbMock.slice(0, totalConfirm),
          ),
        );
      jest.spyOn(safeRepo, 'getSafeById').mockResolvedValue(
        plainToInstance(
          Safe,
          safeDbMock.find((safe) => safe.threshold === threshold),
        ),
      );

      mockRepo.findOne = jest.fn().mockResolvedValue(null);

      try {
        await multisigTransactionRepo.updateAwaitingExecutionTx(txId, safeId);
      } catch (error) {
        expect(error).toEqual(new CustomError(ErrorMap.TRANSACTION_NOT_EXIST));
      }
    });
  });

  describe('getMultisigTxDetail', () => {
    it('should get multisig tx detail', async () => {
      const txId = 1;

      mockRepo.createQueryBuilder = jest.fn().mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(getMultisigDetailResponseMock),
      });

      const result = await multisigTransactionRepo.getMultisigTxDetail(txId);
      expect(result).toStrictEqual(getMultisigDetailResponseMock);
    });

    it('should throw transaction not exist', async () => {
      const txId = 1;

      mockRepo.createQueryBuilder = jest.fn().mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(undefined),
      });

      try {
        await multisigTransactionRepo.getMultisigTxDetail(txId);
      } catch (error) {
        expect(error).toEqual(new CustomError(ErrorMap.TRANSACTION_NOT_EXIST));
      }
    });
  });

  describe('getQueueTransaction', () => {
    it('should get queue transaction', async () => {
      const safeAddress = 'aura1qc4y4awjmx9zjzqapucr66tdzf34zq0uxjraf7';
      const internalChainId = 22;
      const pageIndex = 1;
      const limit = 10;

      mockRepo.createQueryBuilder = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([getMultisigDetailResponseMock]),
      });

      const result = await multisigTransactionRepo.getQueueTransaction(
        safeAddress,
        internalChainId,
        pageIndex,
        limit,
      );

      expect(result).toStrictEqual([getMultisigDetailResponseMock]);
    });
  });
});
