import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ErrorMap } from 'src/common/error.map';
import {
  ENTITIES_CONFIG,
  MODULE_REQUEST,
  REPOSITORY_INTERFACE,
  SERVICE_INTERFACE,
} from 'src/module.config';
import { GeneralRepository } from 'src/repositories/impls/general.repository';
import { MultisigWalletOwnerRepository } from 'src/repositories/impls/multisig-wallet-owner.repository';
import { MultisigWalletRepository } from 'src/repositories/impls/multisig-wallet.repository';
import { GeneralService } from 'src/services/impls/general.service';
import { MultisigWalletService } from 'src/services/impls/multisig-wallet.service';
import { SharedModule } from 'src/shared/shared.module';
import { OwnerController } from './owner.controller';

describe(OwnerController.name, () => {
  let testModule: TestingModule;
  let ownerController: OwnerController;
  let mockCreateQueryBuilder: jest.Mock;

  beforeAll(async () => {
    mockCreateQueryBuilder = jest.fn(() => ({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    }));

    testModule = await Test.createTestingModule({
      controllers: [OwnerController],
      providers: [
        MultisigWalletService,
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.CHAIN),
          useValue: {},
        },
        //mock
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.SAFE),
          useValue: {
            createQueryBuilder: mockCreateQueryBuilder,
          },
        },
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.SAFE_OWNER),
          useValue: {},
        },
        //repository
        {
          provide: REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY,
          useClass: MultisigWalletRepository,
        },
        {
          provide: REPOSITORY_INTERFACE.IMULTISIG_WALLET_OWNER_REPOSITORY,
          useClass: MultisigWalletOwnerRepository,
        },
        {
          provide: REPOSITORY_INTERFACE.IGENERAL_REPOSITORY,
          useClass: GeneralRepository,
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
    ownerController = testModule.get<OwnerController>(OwnerController);
  });

  beforeEach(() => {});
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {});
  describe('when get multisig wallets by owner', () => {
    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const param: MODULE_REQUEST.GetSafesByOwnerAddressParams = {
        address: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
      };
      const query: MODULE_REQUEST.GetSafesByOwnerAddressQuery = {
        internalChainId: 3,
      };

      // find safe
      const result = await ownerController.getSafes(param, query);
      expect(result.Message).toEqual(ErrorMap.SUCCESSFUL.Message);
    });
  });
});
