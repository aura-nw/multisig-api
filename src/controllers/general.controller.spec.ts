import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ErrorMap } from 'src/common/error.map';
import { mockSafe } from 'src/mock/safe.mock';
import {
  ENTITIES_CONFIG,
  MODULE_REQUEST,
  REPOSITORY_INTERFACE,
  SERVICE_INTERFACE,
} from 'src/module.config';
import { MultisigWalletOwnerRepository } from 'src/repositories/impls';
import { GeneralRepository } from 'src/repositories/impls/general.repository';
import { MultisigWalletRepository } from 'src/repositories/impls/multisig-wallet.repository';
import { GeneralService } from 'src/services/impls/general.service';
import { MultisigWalletService } from 'src/services/impls/multisig-wallet.service';
import { SharedModule } from 'src/shared/shared.module';
import { GeneralController } from './general.controller';

describe(GeneralController.name, () => {
  let testModule: TestingModule;
  let generalController: GeneralController;

  let mockFindChainByCondition: jest.Mock;
  let mockCreateQueryBuilder: jest.Mock;
  let mockFindSafeByCondition: jest.Mock;

  beforeAll(async () => {
    mockFindChainByCondition = jest.fn();
    mockCreateQueryBuilder = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    }));
    mockFindSafeByCondition = jest.fn();

    testModule = await Test.createTestingModule({
      controllers: [GeneralController],
      providers: [
        GeneralService,
        //mock
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.CHAIN),
          useValue: {
            find: mockFindChainByCondition,
            createQueryBuilder: mockCreateQueryBuilder,
          },
        },
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.SAFE),
          useValue: {
            find: mockFindSafeByCondition,
          },
        },
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.SAFE_OWNER),
          useValue: {},
        },
        //repository
        {
          provide: REPOSITORY_INTERFACE.IGENERAL_REPOSITORY,
          useClass: GeneralRepository,
        },
        {
          provide: REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY,
          useClass: MultisigWalletRepository,
        },
        {
          provide: REPOSITORY_INTERFACE.IMULTISIG_WALLET_OWNER_REPOSITORY,
          useClass: MultisigWalletOwnerRepository,
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
      ],
      imports: [SharedModule],
    }).compile();
    generalController = testModule.get<GeneralController>(GeneralController);
  });

  beforeEach(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {});

  describe('When get list of chains', () => {
    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const result = await generalController.showNetworkList();

      expect(result.Message).toEqual(ErrorMap.SUCCESSFUL.Message);
    });
  });

  describe('When get account onchain information', () => {
    it(`should return error: ${ErrorMap.NO_SAFES_FOUND}`, async () => {
      const param: MODULE_REQUEST.GetAccountOnchainParam = {
        safeAddress: '123',
        internalChainId: 3,
      };

      mockFindSafeByCondition.mockResolvedValue([]);

      const result = await generalController.getAccountOnchain(param);
      expect(result.Message).toEqual(ErrorMap.NO_SAFES_FOUND.Message);
    });

    it(`should return error: ${ErrorMap.CHAIN_ID_NOT_EXIST}`, async () => {
      const param: MODULE_REQUEST.GetAccountOnchainParam = {
        safeAddress: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
        internalChainId: 1,
      };
      // find safe
      mockFindSafeByCondition.mockResolvedValue(mockSafe);
      // find chain
      mockFindChainByCondition.mockResolvedValue([]);

      const result = await generalController.getAccountOnchain(param);
      expect(result.Message).toEqual(ErrorMap.CHAIN_ID_NOT_EXIST.Message);
    });
  });
});
