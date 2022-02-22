import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SAFE_STATUS } from 'src/common/constants/app.constant';
import { ErrorMap } from 'src/common/error.map';
import {
  mockChain,
  mockCreateRequest,
  mockSafe,
  mockSafeOwner,
} from 'src/mock/safe.mock';
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
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // if have db connection
    // testModule.close();
  });

  describe('when create a multisig wallet', () => {
    it(`should return error: ${ErrorMap.OTHER_ADDRESS_INCLUDE_CREATOR.Message}`, async () => {
      const result = await safeController.createMultisigWallet(
        mockCreateRequest[0],
      );
      expect(result.Message).toEqual(
        ErrorMap.OTHER_ADDRESS_INCLUDE_CREATOR.Message,
      );
    });

    it(`should return error: ${ErrorMap.DUPLICATE_SAFE_OWNER.Message}`, async () => {
      const result = await safeController.createMultisigWallet(
        mockCreateRequest[1],
      );
      expect(result.Message).toEqual(ErrorMap.DUPLICATE_SAFE_OWNER.Message);
    });

    it(`should return error: ${ErrorMap.CHAIN_ID_NOT_EXIST.Message}`, async () => {
      // find chain by internalChainId
      mockFindOneChain.mockResolvedValue(undefined);
      const result = await safeController.createMultisigWallet(
        mockCreateRequest[2],
      );
      expect(result.Message).toEqual(ErrorMap.CHAIN_ID_NOT_EXIST.Message);
    });

    it(`should return error: ${ErrorMap.DUPLICATE_SAFE_ADDRESS_HASH.Message}`, async () => {
      // find chain by internalChainId
      mockFindOneChain.mockResolvedValue({});
      // find exist safe by address hash
      mockFindSafeByCondition.mockResolvedValue([
        {
          status: SAFE_STATUS.PENDING,
        },
      ]);
      const result = await safeController.createMultisigWallet(
        mockCreateRequest[2],
      );
      expect(result.Message).toEqual(
        ErrorMap.DUPLICATE_SAFE_ADDRESS_HASH.Message,
      );
    });

    it(`should return error: ${ErrorMap.CANNOT_CREATE_SAFE_ADDRESS.Message}`, async () => {
      // find chain by internalChainId
      mockFindOneChain.mockResolvedValue({});
      // find exist safe by address hash
      mockFindSafeByCondition.mockResolvedValue(undefined);

      const result = await safeController.createMultisigWallet(
        mockCreateRequest[3],
      );
      expect(result.Message).toEqual(
        ErrorMap.CANNOT_CREATE_SAFE_ADDRESS.Message,
      );
    });

    it(`should return error: ${ErrorMap.INSERT_SAFE_FAILED.Message}`, async () => {
      // find chain by internalChainId
      mockFindOneChain.mockResolvedValue({});
      // find exist safe by address hash
      mockFindSafeByCondition.mockResolvedValue(undefined);
      // insert safe to db
      mockInsertSafe.mockRejectedValue({});

      const result = await safeController.createMultisigWallet(
        mockCreateRequest[2],
      );
      expect(result.Message).toEqual(ErrorMap.INSERT_SAFE_FAILED.Message);
    });

    it(`should return error: ${ErrorMap.INSERT_SAFE_OWNER_FAILED.Message}`, async () => {
      // find chain by internalChainId
      mockFindOneChain.mockResolvedValue({});
      // find exist safe by address hash
      mockFindSafeByCondition.mockResolvedValue(undefined);
      // insert safe to db
      let mockSafe: any = {};
      Object.assign(mockSafe, mockCreateRequest[2]);
      mockSafe.safeId = '1';
      mockInsertSafe.mockResolvedValue(mockSafe);
      // insert save owner
      mockInsertSafeOwner.mockRejectedValue({});

      const result = await safeController.createMultisigWallet(
        mockCreateRequest[2],
      );
      expect(result.Message).toEqual(ErrorMap.INSERT_SAFE_OWNER_FAILED.Message);
    });

    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      // find chain by internalChainId
      mockFindOneChain.mockResolvedValue({});
      // find exist safe by address hash
      mockFindSafeByCondition.mockResolvedValue(undefined);
      // insert safe to db
      let mockSafe: any = {};
      Object.assign(mockSafe, mockCreateRequest[2]);
      mockSafe.safeId = '1';
      mockInsertSafe.mockResolvedValue(mockSafe);
      // insert save owner
      mockInsertSafeOwner.mockResolvedValue({});

      const result = await safeController.createMultisigWallet(
        mockCreateRequest[2],
      );
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
        expect(result.Message).toEqual(ErrorMap.NO_SAFES_FOUND.Message);
      });

      it(`should return error: ${ErrorMap.NO_SAFE_OWNERS_FOUND.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: '2',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: undefined,
        };

        // find safe
        mockFindSafeByCondition.mockResolvedValue([mockSafe[0]]);
        // find safe owner
        mockFindSafeOwnerByCondition.mockResolvedValue([]);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.Message).toEqual(ErrorMap.NO_SAFE_OWNERS_FOUND.Message);
      });

      it(`should return error: ${ErrorMap.CHAIN_ID_NOT_EXIST.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: '3',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: undefined,
        };

        // find safe
        mockFindSafeByCondition.mockResolvedValue([mockSafe[1]]);
        // find safe owner

        mockFindSafeOwnerByCondition.mockResolvedValue([mockSafeOwner[0]]);
        // find chainInfo
        mockFindOneChain.mockResolvedValue(undefined);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.Message).toEqual(ErrorMap.CHAIN_ID_NOT_EXIST.Message);
      });

      it(`should return error: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: '3',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: undefined,
        };

        // find safe
        mockFindSafeByCondition.mockResolvedValue([mockSafe[0]]);
        // find safe owner
        mockFindSafeOwnerByCondition.mockResolvedValue([mockSafeOwner[0]]);
        // find chainInfo
        mockFindOneChain.mockResolvedValue(mockChain[0]);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.Message).toEqual(ErrorMap.SUCCESSFUL.Message);
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
        expect(result.Message).toEqual(ErrorMap.NO_SAFES_FOUND.Message);
      });

      it(`should return error: ${ErrorMap.NO_SAFE_OWNERS_FOUND.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: 3,
        };

        // find safe
        mockFindSafeByCondition.mockResolvedValue([mockSafe[0]]);
        // find safe owner
        mockFindSafeOwnerByCondition.mockResolvedValue([]);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.Message).toEqual(ErrorMap.NO_SAFE_OWNERS_FOUND.Message);
      });

      it(`should return error: ${ErrorMap.CHAIN_ID_NOT_EXIST.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: 3,
        };

        // find safe
        mockFindSafeByCondition.mockResolvedValue([mockSafe[1]]);
        // find safe owner
        mockFindSafeOwnerByCondition.mockResolvedValue([mockSafeOwner[0]]);
        // find chainInfo
        mockFindOneChain.mockResolvedValue(undefined);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.Message).toEqual(ErrorMap.CHAIN_ID_NOT_EXIST.Message);
      });

      it(`should return error: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
        const param: MODULE_REQUEST.GetSafePathParams = {
          safeId: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
        };
        const query: MODULE_REQUEST.GetSafeQuery = {
          internalChainId: 3,
        };

        // find safe
        mockFindSafeByCondition.mockResolvedValue([mockSafe[1]]);
        // find safe owner
        mockFindSafeOwnerByCondition.mockResolvedValue([mockSafeOwner[0]]);
        // find chainInfo
        mockFindOneChain.mockResolvedValue(mockChain[0]);

        const result = await safeController.getMultisigWallet(param, query);
        expect(result.Message).toEqual(ErrorMap.SUCCESSFUL.Message);
      });
    });
  });

  describe('when confirm a multisig wallet', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it(`should return error: ${ErrorMap.NO_SAFES_FOUND.Message}`, async () => {
      const param: MODULE_REQUEST.ConfirmSafePathParams = {
        safeId: '1',
      };
      const request: MODULE_REQUEST.ConfirmMultisigWalletRequest = {
        myAddress: '',
        myPubkey: '',
      };

      // find safe
      mockFindSafeByCondition.mockResolvedValue([]);

      const result = await safeController.confirmMultisigWallet(param, request);
      expect(result.Message).toEqual(ErrorMap.NO_SAFES_FOUND.Message);
    });

    it(`should return error: ${ErrorMap.SAFE_NOT_PENDING.Message}`, async () => {
      const param: MODULE_REQUEST.ConfirmSafePathParams = {
        safeId: '3',
      };
      const request: MODULE_REQUEST.ConfirmMultisigWalletRequest = {
        myAddress: '',
        myPubkey: '',
      };

      // find safe
      mockFindSafeByCondition.mockResolvedValue([mockSafe[1]]);

      const result = await safeController.confirmMultisigWallet(param, request);
      expect(result.Message).toEqual(ErrorMap.SAFE_NOT_PENDING.Message);
    });

    it(`should return error: ${ErrorMap.SAFE_OWNERS_NOT_INCLUDE_ADDRESS.Message}`, async () => {
      const param: MODULE_REQUEST.ConfirmSafePathParams = {
        safeId: '3',
      };
      const request: MODULE_REQUEST.ConfirmMultisigWalletRequest = {
        myAddress: 'not exist',
        myPubkey: '',
      };

      // find safe
      mockFindSafeByCondition.mockResolvedValue([mockSafe[2]]);
      // find safe owners
      mockFindSafeOwnerByCondition.mockResolvedValue([
        mockSafeOwner[0],
        mockSafeOwner[1],
      ]);

      const result = await safeController.confirmMultisigWallet(param, request);
      expect(result.Message).toEqual(
        ErrorMap.SAFE_OWNERS_NOT_INCLUDE_ADDRESS.Message,
      );
    });

    it(`should return error: ${ErrorMap.SAFE_OWNER_PUBKEY_NOT_EMPTY.Message}`, async () => {
      const param: MODULE_REQUEST.ConfirmSafePathParams = {
        safeId: '4',
      };
      const request: MODULE_REQUEST.ConfirmMultisigWalletRequest = {
        myAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
        myPubkey: '1234',
      };

      // find safe
      mockFindSafeByCondition.mockResolvedValue([mockSafe[2]]);
      // find safe owners
      mockFindSafeOwnerByCondition.mockResolvedValue([
        mockSafeOwner[1],
        mockSafeOwner[2],
      ]);

      const result = await safeController.confirmMultisigWallet(param, request);
      expect(result.Message).toEqual(
        ErrorMap.SAFE_OWNER_PUBKEY_NOT_EMPTY.Message,
      );
    });

    it(`should return error: ${ErrorMap.UPDATE_SAFE_OWNER_FAILED.Message}`, async () => {
      const param: MODULE_REQUEST.ConfirmSafePathParams = {
        safeId: '4',
      };
      const request: MODULE_REQUEST.ConfirmMultisigWalletRequest = {
        myAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
        myPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk',
      };

      // find safe
      mockFindSafeByCondition.mockResolvedValue([mockSafe[2]]);
      // find safe owners
      mockFindSafeOwnerByCondition.mockResolvedValue([
        mockSafeOwner[0],
        mockSafeOwner[1],
      ]);
      // update save owner
      mockInsertSafeOwner.mockResolvedValue(undefined);

      const result = await safeController.confirmMultisigWallet(param, request);
      expect(result.Message).toEqual(ErrorMap.UPDATE_SAFE_OWNER_FAILED.Message);
    });

    describe('and have another safes with pending status', () => {
      it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
        const param: MODULE_REQUEST.ConfirmSafePathParams = {
          safeId: '4',
        };
        const request: MODULE_REQUEST.ConfirmMultisigWalletRequest = {
          myAddress: 'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
          myPubkey: 'A9+iothzb3kRD9MOzHqaKsM7ooptslYBIXN+Rz4+cg+y',
        };

        // find safe
        mockFindSafeByCondition.mockResolvedValue([mockSafe[2]]);
        // find safe owners
        mockFindSafeOwnerByCondition.mockResolvedValue([
          mockSafeOwner[4],
          mockSafeOwner[5],
        ]);
        // update save owner
        mockInsertSafeOwner.mockResolvedValue({});

        const result = await safeController.confirmMultisigWallet(
          param,
          request,
        );
        expect(result.Message).toEqual(ErrorMap.SUCCESSFUL.Message);
      });
    });

    describe('and fully confirmed', () => {
      it(`should return error: ${ErrorMap.CHAIN_ID_NOT_EXIST.Message}`, async () => {
        const param: MODULE_REQUEST.ConfirmSafePathParams = {
          safeId: '4',
        };
        const request: MODULE_REQUEST.ConfirmMultisigWalletRequest = {
          myAddress: 'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
          myPubkey: 'A9+iothzb3kRD9MOzHqaKsM7ooptslYBIXN+Rz4+cg+y',
        };

        // find safe
        mockFindSafeByCondition.mockResolvedValue([mockSafe[2]]);
        // find safe owners
        mockFindSafeOwnerByCondition.mockResolvedValue([
          mockSafeOwner[2],
          mockSafeOwner[6],
        ]);
        // update save owner
        mockInsertSafeOwner.mockResolvedValue({});
        // get chainid
        mockFindOneChain.mockResolvedValue(undefined);

        const result = await safeController.confirmMultisigWallet(
          param,
          request,
        );
        expect(result.Message).toEqual(ErrorMap.CHAIN_ID_NOT_EXIST.Message);
      });

      it(`should return error: ${ErrorMap.CANNOT_CREATE_SAFE_ADDRESS.Message}`, async () => {
        const param: MODULE_REQUEST.ConfirmSafePathParams = {
          safeId: '4',
        };
        const request: MODULE_REQUEST.ConfirmMultisigWalletRequest = {
          myAddress: 'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
          myPubkey: 'invalid pubkey',
        };

        // find safe
        mockFindSafeByCondition.mockResolvedValue([mockSafe[2]]);
        // find safe owners
        mockFindSafeOwnerByCondition.mockResolvedValue([
          mockSafeOwner[2],
          mockSafeOwner[7],
        ]);
        // update save owner
        mockInsertSafeOwner.mockResolvedValue({});
        // get chainid
        mockFindOneChain.mockResolvedValue(mockChain[0]);

        const result = await safeController.confirmMultisigWallet(
          param,
          request,
        );
        expect(result.Message).toEqual(
          ErrorMap.CANNOT_CREATE_SAFE_ADDRESS.Message,
        );
      });

      it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
        const param: MODULE_REQUEST.ConfirmSafePathParams = {
          safeId: '4',
        };
        const request: MODULE_REQUEST.ConfirmMultisigWalletRequest = {
          myAddress: 'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
          myPubkey: 'A9+iothzb3kRD9MOzHqaKsM7ooptslYBIXN+Rz4+cg+y',
        };

        // find safe
        mockFindSafeByCondition.mockResolvedValue([mockSafe[2]]);
        // find safe owners
        mockFindSafeOwnerByCondition.mockResolvedValue([
          mockSafeOwner[2],
          mockSafeOwner[8],
        ]);
        // update save owner
        mockInsertSafeOwner.mockResolvedValue({});
        // get chainid
        mockFindOneChain.mockResolvedValue(mockChain[0]);

        const result = await safeController.confirmMultisigWallet(
          param,
          request,
        );
        expect(result.Message).toEqual(ErrorMap.SUCCESSFUL.Message);
      });
    });
  });

  describe('when delete a pending multisig wallet', () => {
    it(`should return error: ${ErrorMap.NO_SAFES_FOUND.Message}`, async () => {
      const param: MODULE_REQUEST.DeleteSafePathParams = {
        safeId: '1',
      };
      const request: MODULE_REQUEST.DeleteMultisigWalletRequest = {
        myAddress: '',
      };

      // find safe
      mockFindSafeByCondition.mockResolvedValue([]);

      const result = await safeController.deletePendingMultisigWallet(
        param,
        request,
      );
      expect(result.Message).toEqual(ErrorMap.NO_SAFES_FOUND.Message);
    });

    it(`should return error: ${ErrorMap.ADDRESS_NOT_CREATOR.Message}`, async () => {
      const param: MODULE_REQUEST.DeleteSafePathParams = {
        safeId: '4',
      };
      const request: MODULE_REQUEST.DeleteMultisigWalletRequest = {
        myAddress: 'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
      };

      // find safe
      mockFindSafeByCondition.mockResolvedValue([mockSafe[2]]);

      const result = await safeController.deletePendingMultisigWallet(
        param,
        request,
      );
      expect(result.Message).toEqual(ErrorMap.ADDRESS_NOT_CREATOR.Message);
    });

    it(`should return error: ${ErrorMap.SAFE_NOT_PENDING.Message}`, async () => {
      const param: MODULE_REQUEST.DeleteSafePathParams = {
        safeId: '3',
      };
      const request: MODULE_REQUEST.DeleteMultisigWalletRequest = {
        myAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
      };

      // find safe
      mockFindSafeByCondition.mockResolvedValue([mockSafe[1]]);

      const result = await safeController.deletePendingMultisigWallet(
        param,
        request,
      );
      expect(result.Message).toEqual(ErrorMap.SAFE_NOT_PENDING.Message);
    });

    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const param: MODULE_REQUEST.DeleteSafePathParams = {
        safeId: '6',
      };
      const request: MODULE_REQUEST.DeleteMultisigWalletRequest = {
        myAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
      };

      // find safe
      mockFindSafeByCondition.mockResolvedValue([mockSafe[4]]);
      mockInsertSafe.mockResolvedValue({});

      const result = await safeController.deletePendingMultisigWallet(
        param,
        request,
      );
      expect(result.Message).toEqual(ErrorMap.SUCCESSFUL.Message);
    });
  });
});
