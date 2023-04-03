import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { MockFactory } from '../../common/mock';
import { confirmedMock, safeOwnerDbMock } from '../../mock';
import { MultisigConfirm } from './entities/multisig-confirm.entity';
import { MultisigConfirmRepository } from './multisig-confirm.repository';
import { multisigConfirmTestingModule } from './multisig-confirm-testing.module';
import { SafeOwnerRepository } from '../safe-owner/safe-owner.repository';
import { ErrorMap } from '../../common/error.map';
import { CustomError } from '../../common/custom-error';
import { ListSafeByOwnerResponseDto } from '../safe-owner/dto/response/get-safe-by-owner.res';
import { GetListConfirmResDto } from './dto';

describe('MultisigConfirmRepository', () => {
  let multisigConfirmRepository: MultisigConfirmRepository;
  let safeOwnerRepo: SafeOwnerRepository;
  let mockRepo = MockFactory.getMock<Repository<MultisigConfirm>>();

  beforeEach(async () => {
    const module: TestingModule = await multisigConfirmTestingModule
      .overrideProvider(getRepositoryToken(MultisigConfirm))
      .useValue(mockRepo)
      .compile();

    multisigConfirmRepository = module.get<MultisigConfirmRepository>(
      MultisigConfirmRepository,
    );
    safeOwnerRepo = module.get<SafeOwnerRepository>(SafeOwnerRepository);
  });

  it('should be defined', () => {
    expect(multisigConfirmRepository).toBeDefined();
  });

  describe('getConfirmedByTxId', () => {
    it('should return array of confirmations', async () => {
      const multisigTransactionId = 1;

      const expected = plainToInstance(MultisigConfirm, []);
      mockRepo.find = jest.fn().mockReturnValue([]);

      expect(
        await multisigConfirmRepository.getConfirmedByTxId(
          multisigTransactionId,
        ),
      ).toStrictEqual(expected);
    });
  });

  describe('getRejects', () => {
    it('should return array of rejections', async () => {
      const multisigTransactionId = 1;

      const expected = plainToInstance(MultisigConfirm, []);
      mockRepo.find = jest.fn().mockReturnValue([]);

      expect(
        await multisigConfirmRepository.getRejects(multisigTransactionId),
      ).toStrictEqual(expected);
    });
  });

  describe('insertIntoMultisigConfirm', () => {
    it('should return insert record to db', async () => {
      const mock = {
        multisigTransactionId: 1,
        ownerAddress: 'adr',
        signature: 'sig',
        bodyBytes: 'body',
        internalChainId: 22,
        status: 'active',
      };

      const expected = plainToInstance(MultisigConfirm, mock);
      mockRepo.save = jest.fn().mockReturnValue(expected);

      expect(
        await multisigConfirmRepository.insertIntoMultisigConfirm(
          mock.multisigTransactionId,
          mock.ownerAddress,
          mock.signature,
          mock.bodyBytes,
          mock.internalChainId,
          mock.status,
        ),
      ).toStrictEqual(expected);
    });
  });

  describe('checkUserHasSigned', () => {
    it(
      'should throw error: ' + ErrorMap.USER_HAS_CONFIRMED.Message,
      async () => {
        const transactionId = 1;
        const ownerAddress = 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5';

        mockRepo.findOne = jest.fn().mockReturnValue(confirmedMock);

        try {
          await multisigConfirmRepository.checkUserHasSigned(
            transactionId,
            ownerAddress,
          );
        } catch (error) {
          expect(error).toEqual(new CustomError(ErrorMap.USER_HAS_CONFIRMED));
        }
      },
    );

    it('should not throw error', async () => {
      const transactionId = 1;
      const ownerAddress = 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5';

      mockRepo.findOne = jest.fn().mockReturnValue(undefined);
      await expect(
        multisigConfirmRepository.checkUserHasSigned(
          transactionId,
          ownerAddress,
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('validateSafeOwner', () => {
    it(
      'should throw error: ' + ErrorMap.PERMISSION_DENIED.Message,
      async () => {
        const internalChainId = 22;
        const safeAddress = '1';
        const ownerAddress = 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5';

        jest
          .spyOn(safeOwnerRepo, 'getMultisigWalletsByOwner')
          .mockImplementation(
            async () =>
              safeOwnerDbMock as unknown as ListSafeByOwnerResponseDto[],
          );

        try {
          await multisigConfirmRepository.validateSafeOwner(
            ownerAddress,
            safeAddress,
            internalChainId,
          );
        } catch (error) {
          expect(error).toEqual(new CustomError(ErrorMap.PERMISSION_DENIED));
        }
      },
    );

    it('should not throw error', async () => {
      const internalChainId = 22;
      const safeAddress = 'aura132akx9989canxuzkfjnrgxwyccfcmtfzhmflqm';
      const ownerAddress = 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5';

      jest
        .spyOn(safeOwnerRepo, 'getMultisigWalletsByOwner')
        .mockImplementation(
          async () =>
            safeOwnerDbMock as unknown as ListSafeByOwnerResponseDto[],
        );

      await expect(
        multisigConfirmRepository.validateSafeOwner(
          ownerAddress,
          safeAddress,
          internalChainId,
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('getListConfirmMultisigTransaction', () => {
    it('should return list confirm multisig transaction', async () => {
      mockRepo.createQueryBuilder = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      }));

      expect(
        await multisigConfirmRepository.getListConfirmMultisigTransaction(),
      ).toStrictEqual(plainToInstance(GetListConfirmResDto, []));
    });
  });
});
