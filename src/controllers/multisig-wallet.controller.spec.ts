import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
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
import { MultisigWalletController } from './multisig-wallet.controller';

jest.mock('src/utils/network.utils', () => {
  return {
    Network: jest.fn().mockImplementation(() => {
      return {
        constructor: () => {},
        init: () => Promise.resolve({}),
        getBalance: () => {
          const mockCoin = {
            denom: 'aura',
            amount: '1',
          };
          return Promise.resolve(mockCoin);
        },
      };
    }),
  };
});

describe(MultisigWalletController.name, () => {
  let testModule: TestingModule;
  let safeController: MultisigWalletController;

  let mockFindOneChain: jest.Mock;
  let mockFindSafeByCondition: jest.Mock;
  let mockFindSafeOwnerByCondition: jest.Mock;
  let mockInsertSafe: jest.Mock;
  let mockInsertSafeOwner: jest.Mock;

  beforeAll(async () => {
    mockFindOneChain = jest.fn();
    mockFindSafeByCondition = jest.fn();
    mockFindSafeOwnerByCondition = jest.fn();
    mockInsertSafe = jest.fn();
    mockInsertSafeOwner = jest.fn();

    testModule = await Test.createTestingModule({
      controllers: [MultisigWalletController],
      providers: [
        MultisigWalletService,
        //mock
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.CHAIN),
          useValue: {
            findOne: mockFindOneChain,
          },
        },
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.SAFE),
          useValue: {
            find: mockFindSafeByCondition,
            save: mockInsertSafe,
          },
        },
        {
          provide: getRepositoryToken(ENTITIES_CONFIG.SAFE_OWNER),
          useValue: {
            save: mockInsertSafeOwner,
            find: mockFindSafeOwnerByCondition,
          },
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
      imports: [
        SharedModule,
        // not using db
        // TypeOrmModule.forFeature([...entities]),
        // TypeOrmModule.forRootAsync({
        //   imports: [SharedModule],
        //   useFactory: (configService: ConfigService) =>
        //     configService.typeOrmConfig,
        //   inject: [ConfigService],
        // }),
      ],
    }).compile();
    safeController = testModule.get<MultisigWalletController>(
      MultisigWalletController,
    );
  });

  beforeEach(() => {});

  afterAll(async () => {
    // if have db connection
    // testModule.close();
  });

  describe('when create a multisig wallet', () => {
    it(`should return error: ${ErrorMap.OTHER_ADDRESS_INCLUDE_CREATOR.Message}`, async () => {
      const request: MODULE_REQUEST.CreateMultisigWalletRequest = {
        creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
        creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8k',
        otherOwnersAddress: ['aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz'],
        threshold: 1,
        internalChainId: 3,
      };

      const result = await safeController.createMultisigWallet(request);
      expect(result.ErrorCode).toEqual(
        ErrorMap.OTHER_ADDRESS_INCLUDE_CREATOR.Code,
      );
    });

    it(`should return error: ${ErrorMap.DUPLICATE_SAFE_OWNER.Message}`, async () => {
      const request: MODULE_REQUEST.CreateMultisigWalletRequest = {
        creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
        creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8k',
        otherOwnersAddress: [
          'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
          'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
        ],
        threshold: 1,
        internalChainId: 3,
      };

      const result = await safeController.createMultisigWallet(request);
      expect(result.ErrorCode).toEqual(ErrorMap.DUPLICATE_SAFE_OWNER.Code);
    });

    it(`should return error: ${ErrorMap.CHAIN_ID_NOT_EXIST.Message}`, async () => {
      const request: MODULE_REQUEST.CreateMultisigWalletRequest = {
        creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
        creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk',
        otherOwnersAddress: [],
        threshold: 1,
        internalChainId: 3,
      };

      // find chain by internalChainId
      mockFindOneChain.mockResolvedValue(undefined);
      const result = await safeController.createMultisigWallet(request);
      expect(result.Message).toEqual(ErrorMap.CHAIN_ID_NOT_EXIST.Message);
    });

    it(`should return error: ${ErrorMap.DUPLICATE_SAFE_ADDRESS_HASH.Message}`, async () => {
      const request: MODULE_REQUEST.CreateMultisigWalletRequest = {
        creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
        creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk',
        otherOwnersAddress: [],
        threshold: 1,
        internalChainId: 3,
      };

      // find chain by internalChainId
      mockFindOneChain.mockResolvedValue({});
      // find exist safe by address hash
      mockFindSafeByCondition.mockResolvedValue([
        {
          status: SAFE_STATUS.PENDING,
        },
      ]);
      const result = await safeController.createMultisigWallet(request);
      expect(result.Message).toEqual(
        ErrorMap.DUPLICATE_SAFE_ADDRESS_HASH.Message,
      );
    });

    it(`should return error: ${ErrorMap.CANNOT_CREATE_SAFE_ADDRESS.Message}`, async () => {
      const request: MODULE_REQUEST.CreateMultisigWalletRequest = {
        creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
        creatorPubkey: '1',
        otherOwnersAddress: [],
        threshold: 1,
        internalChainId: 3,
      };

      // find chain by internalChainId
      mockFindOneChain.mockResolvedValue({});
      // find exist safe by address hash
      mockFindSafeByCondition.mockResolvedValue(undefined);

      const result = await safeController.createMultisigWallet(request);
      expect(result.Message).toEqual(
        ErrorMap.CANNOT_CREATE_SAFE_ADDRESS.Message,
      );
    });

    it(`should return error: ${ErrorMap.INSERT_SAFE_FAILED.Message}`, async () => {
      const request: MODULE_REQUEST.CreateMultisigWalletRequest = {
        creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
        creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk',
        otherOwnersAddress: [],
        threshold: 1,
        internalChainId: 3,
      };

      // find chain by internalChainId
      mockFindOneChain.mockResolvedValue({});
      // find exist safe by address hash
      mockFindSafeByCondition.mockResolvedValue(undefined);
      // insert safe to db
      mockInsertSafe.mockRejectedValue({});

      const result = await safeController.createMultisigWallet(request);
      expect(result.Message).toEqual(ErrorMap.INSERT_SAFE_FAILED.Message);
    });

    it(`should return error: ${ErrorMap.INSERT_SAFE_OWNER_FAILED.Message}`, async () => {
      const request: MODULE_REQUEST.CreateMultisigWalletRequest = {
        creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
        creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk',
        otherOwnersAddress: [],
        threshold: 1,
        internalChainId: 3,
      };

      // find chain by internalChainId
      mockFindOneChain.mockResolvedValue({});
      // find exist safe by address hash
      mockFindSafeByCondition.mockResolvedValue(undefined);
      // insert safe to db
      let mockSafe: any = {};
      Object.assign(mockSafe, request);
      mockSafe.safeId = '1';
      mockInsertSafe.mockResolvedValue(mockSafe);
      // insert save owner
      mockInsertSafeOwner.mockRejectedValue({});

      const result = await safeController.createMultisigWallet(request);
      expect(result.Message).toEqual(ErrorMap.INSERT_SAFE_OWNER_FAILED.Message);
    });

    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const request: MODULE_REQUEST.CreateMultisigWalletRequest = {
        creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
        creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk',
        otherOwnersAddress: [],
        threshold: 1,
        internalChainId: 3,
      };

      // find chain by internalChainId
      mockFindOneChain.mockResolvedValue({});
      // find exist safe by address hash
      mockFindSafeByCondition.mockResolvedValue(undefined);
      // insert safe to db
      let mockSafe: any = {};
      Object.assign(mockSafe, request);
      mockSafe.safeId = '1';
      mockInsertSafe.mockResolvedValue(mockSafe);
      // insert save owner
      mockInsertSafeOwner.mockResolvedValue({});

      const result = await safeController.createMultisigWallet(request);
      expect(result.Message).toEqual(ErrorMap.SUCCESSFUL.Message);
    });
  });

  describe('when get a multisig wallet', () => {
    describe('by safeid', () => {
      it(`should return error: ${ErrorMap.NO_SAFES_FOUND.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: '1',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: undefined,
        };
        // find safe
        mockFindSafeByCondition.mockResolvedValue([]);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.ErrorCode).toEqual(ErrorMap.NO_SAFES_FOUND.Code);
      });

      it(`should return error: ${ErrorMap.NO_SAFE_OWNERS_FOUND.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: '2',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: undefined,
        };

        // find safe
        const mockSafe = {
          id: 2,
        };
        mockFindSafeByCondition.mockResolvedValue([mockSafe]);
        // find safe owner
        mockFindSafeOwnerByCondition.mockResolvedValue([]);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.ErrorCode).toEqual(ErrorMap.NO_SAFE_OWNERS_FOUND.Code);
      });

      it(`should return error: ${ErrorMap.CHAIN_ID_NOT_EXIST.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: '3',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: undefined,
        };

        // find safe
        const mockSafe = {
          id: 3,
          safeAddress: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
          safePubkey:
            '{"type":"tendermint/PubKeyMultisigThreshold","value":{"threshold":"1","pubkeys":[{"type":"tendermint/PubKeySecp256k1","value":"A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk"}]}}',
          threshold: 1,
          status: 'created',
          internalChainId: 3,
        };
        mockFindSafeByCondition.mockResolvedValue([mockSafe]);
        // find safe owner
        const mockSafeOwners = [
          {
            ownerAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
          },
        ];
        mockFindSafeOwnerByCondition.mockResolvedValue(mockSafeOwners);
        // find chainInfo
        mockFindOneChain.mockResolvedValue(undefined);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.ErrorCode).toEqual(ErrorMap.CHAIN_ID_NOT_EXIST.Code);
      });

      it(`should return error: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: '3',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: undefined,
        };

        // find safe
        const mockSafe = {
          id: 3,
          safeAddress: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
          safePubkey:
            '{"type":"tendermint/PubKeyMultisigThreshold","value":{"threshold":"1","pubkeys":[{"type":"tendermint/PubKeySecp256k1","value":"A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk"}]}}',
          threshold: 1,
          status: 'created',
          internalChainId: 3,
        };
        mockFindSafeByCondition.mockResolvedValue([mockSafe]);
        // find safe owner
        const mockSafeOwners = [
          {
            ownerAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
          },
        ];
        mockFindSafeOwnerByCondition.mockResolvedValue(mockSafeOwners);
        // find chainInfo
        const mockChain = {
          rpc: 'http://0.0.0.0:26657',
        };
        mockFindOneChain.mockResolvedValue(mockChain);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.ErrorCode).toEqual(ErrorMap.SUCCESSFUL.Code);
      });
    });

    describe('by safeAddress and internalChainId', () => {
      it(`should return error: ${ErrorMap.NO_SAFES_FOUND.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: 3,
        };

        // find safe
        mockFindSafeByCondition.mockResolvedValue([]);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.ErrorCode).toEqual(ErrorMap.NO_SAFES_FOUND.Code);
      });

      it(`should return error: ${ErrorMap.NO_SAFE_OWNERS_FOUND.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: 3,
        };

        // find safe
        const mockSafe = {
          id: 2,
        };
        mockFindSafeByCondition.mockResolvedValue([mockSafe]);
        // find safe owner
        mockFindSafeOwnerByCondition.mockResolvedValue([]);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.ErrorCode).toEqual(ErrorMap.NO_SAFE_OWNERS_FOUND.Code);
      });

      it(`should return error: ${ErrorMap.CHAIN_ID_NOT_EXIST.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: 3,
        };

        // find safe
        const mockSafe = {
          id: 3,
          safeAddress: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
          safePubkey:
            '{"type":"tendermint/PubKeyMultisigThreshold","value":{"threshold":"1","pubkeys":[{"type":"tendermint/PubKeySecp256k1","value":"A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk"}]}}',
          threshold: 1,
          status: 'created',
          internalChainId: 3,
        };
        mockFindSafeByCondition.mockResolvedValue([mockSafe]);
        // find safe owner
        const mockSafeOwners = [
          {
            ownerAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
          },
        ];
        mockFindSafeOwnerByCondition.mockResolvedValue(mockSafeOwners);
        // find chainInfo
        mockFindOneChain.mockResolvedValue(undefined);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.ErrorCode).toEqual(ErrorMap.CHAIN_ID_NOT_EXIST.Code);
      });

      it(`should return error: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: 3,
        };

        // find safe
        const mockSafe = {
          id: 3,
          safeAddress: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
          safePubkey:
            '{"type":"tendermint/PubKeyMultisigThreshold","value":{"threshold":"1","pubkeys":[{"type":"tendermint/PubKeySecp256k1","value":"A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk"}]}}',
          threshold: 1,
          status: 'created',
          internalChainId: 3,
        };
        mockFindSafeByCondition.mockResolvedValue([mockSafe]);
        // find safe owner
        const mockSafeOwners = [
          {
            ownerAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
          },
        ];
        mockFindSafeOwnerByCondition.mockResolvedValue(mockSafeOwners);
        // find chainInfo
        const mockChain = {
          rpc: 'http://0.0.0.0:26657',
        };
        mockFindOneChain.mockResolvedValue(mockChain);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.ErrorCode).toEqual(ErrorMap.SUCCESSFUL.Code);
      });
    });
  });
});
