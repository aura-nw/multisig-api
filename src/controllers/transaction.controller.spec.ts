import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ErrorMap } from 'src/common/error.map';
import { mockChain, mockCreateTransactionRequest } from 'src/mock/transaction.mock';
import {
  ENTITIES_CONFIG,
  MODULE_REQUEST,
  REPOSITORY_INTERFACE,
  SERVICE_INTERFACE,
} from 'src/module.config';
import {
  MultisigConfirmRepository,
  MultisigTransactionRepository,
  TransactionRepository,
} from 'src/repositories/impls';
import { GeneralRepository } from 'src/repositories/impls/general.repository';
import { MultisigWalletOwnerRepository } from 'src/repositories/impls/multisig-wallet-owner.repository';
import { MultisigWalletRepository } from 'src/repositories/impls/multisig-wallet.repository';
import { GeneralService } from 'src/services/impls/general.service';
import { MultisigTransactionService } from 'src/services/impls/multisig-transaction.service';
import { MultisigWalletService } from 'src/services/impls/multisig-wallet.service';
import { TransactionService } from 'src/services/impls/transaction.service';
import { SharedModule } from 'src/shared/shared.module';
import { OwnerController } from './owner.controller';
import { TransactionController } from './transaction.controller';

describe(TransactionController.name, () => {
  let testModule: TestingModule;
  let transactionController: TransactionController;
  let mockFindOneChain: jest.Mock;
  let mockCreateQueryBuilder: jest.Mock;

  beforeAll(async () => {
    mockFindOneChain = jest.fn();
    mockCreateQueryBuilder = jest.fn(() => ({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    }));

    testModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.CHAIN),
          useValue: {
            findOne: mockFindOneChain,
          },
        },
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.SAFE_OWNER),
          useValue: {
            createQueryBuilder: mockCreateQueryBuilder
          },
        },
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.MULTISIG_TRANSACTION),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.AURA_TX),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.MULTISIG_CONFIRM),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.SAFE),
          useValue: {
            createQueryBuilder: mockCreateQueryBuilder
          },
        },
        // //mock
        // {
        //   provide: getRepositoryToken(ENTITIES_CONFIG.SAFE),
        //   useValue: {
        //     createQueryBuilder: mockCreateQueryBuilder,
        //   },
        // },
        // {
        //   provide: getRepositoryToken(ENTITIES_CONFIG.SAFE_OWNER),
        //   useValue: {},
        // },
        //repository
        {
          provide: REPOSITORY_INTERFACE.IMULTISIG_TRANSACTION_REPOSITORY,
          useClass: MultisigTransactionRepository,
        },
        {
          provide: REPOSITORY_INTERFACE.IMULTISIG_WALLET_OWNER_REPOSITORY,
          useClass: MultisigWalletOwnerRepository,
        },
        {
          provide: REPOSITORY_INTERFACE.ITRANSACTION_REPOSITORY,
          useClass: TransactionRepository,
        },
        {
          provide: REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY,
          useClass: MultisigConfirmRepository,
        },
        {
          provide: REPOSITORY_INTERFACE.IGENERAL_REPOSITORY,
          useClass: GeneralRepository,
        },
        {
          provide: REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY,
          useClass: MultisigWalletRepository,
        },
        //service
        {
          provide: SERVICE_INTERFACE.IMULTISIG_WALLET_SERVICE,
          useClass: MultisigWalletService,
        },
        {
          provide: SERVICE_INTERFACE.IGENERAL_SERVICE,
          useClass: GeneralService,
        },
        {
          provide: SERVICE_INTERFACE.IMULTISIG_TRANSACTION_SERVICE,
          useClass: MultisigTransactionService,
        },
        {
          provide: SERVICE_INTERFACE.ITRANSACTION_SERVICE,
          useClass: TransactionService,
        },
      ],
      imports: [SharedModule],
    }).compile();
    transactionController = testModule.get<TransactionController>(
      TransactionController,
    );
  });

  beforeEach(() => {});
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {});
  describe('when create transaction', () => {
    it(`should return: ${ErrorMap.CHAIN_ID_NOT_EXIST.Message}`, async () => {
      // find safe
      mockFindOneChain.mockResolvedValue(undefined);
      const result = await transactionController.createTransaction(
        mockCreateTransactionRequest[0],
      );
      expect(result.Message).toEqual(ErrorMap.CHAIN_ID_NOT_EXIST.Message);
    });

    it(`should return: ${ErrorMap.E500.Message}`, async () => {
      // find safe
      mockFindOneChain.mockResolvedValue(mockChain[2]);
      const result = await transactionController.createTransaction(
        mockCreateTransactionRequest[0],
      );

      // cannot get balance
      expect(result.Message).toEqual(ErrorMap.E500.Message);
    });
  });
});