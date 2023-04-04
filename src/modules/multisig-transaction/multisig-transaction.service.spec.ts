import { TestingModule } from '@nestjs/testing';
import { MultisigTransactionService } from './multisig-transaction.service';
import { multisigTransactionTestingModule } from './multisig-transaction-testing.module';
import { chainDbMock, safeDbMock, userDbMock } from '../../mock';
import { SafeRepository } from '../safe/safe.repository';
import { plainToInstance } from 'class-transformer';
import { Safe } from '../safe/entities/safe.entity';
import { CreateTransactionRequestDto } from './dto';
import { ChainRepository } from '../chain/chain.repository';
import { Chain } from '../chain/entities/chain.entity';
import { IndexerClient } from '../../shared/services';
import { AccountInfo } from '../../common/dtos';
const mockGetAuthInfo = jest.fn().mockReturnValue(userDbMock[0]);
jest.mock('../../utils/common.util', () => {
  return jest.fn().mockImplementation(() => {
    return { getAuthInfo: mockGetAuthInfo };
  });
});

describe('MultisigTransactionService', () => {
  let service: MultisigTransactionService;
  let safeRepo: SafeRepository;
  let chainRepos: ChainRepository;
  let indexerClient: IndexerClient;

  beforeEach(async () => {
    const module: TestingModule =
      await multisigTransactionTestingModule.compile();

    service = module.get<MultisigTransactionService>(
      MultisigTransactionService,
    );

    safeRepo = module.get<SafeRepository>(SafeRepository);
    chainRepos = module.get<ChainRepository>(ChainRepository);
    indexerClient = module.get<IndexerClient>(IndexerClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMultisigTransaction', () => {
    it('should create multisig tx successfully', async () => {
      const request: CreateTransactionRequestDto = {
        from: 'aura1p8zl3nz73k998sjj4hy8eg8at6zuz6detxelg5',
        internalChainId: 22,
      };

      jest
        .spyOn(safeRepo, 'getSafeByAddress')
        .mockResolvedValue(plainToInstance(Safe, safeDbMock[0]));

      jest
        .spyOn(chainRepos, 'findChain')
        .mockResolvedValue(plainToInstance(Chain, chainDbMock[0]));

      jest.spyOn(indexerClient, 'getAccount').mockResolvedValue(
        plainToInstance(AccountInfo, {
          accountNumber: 1,
          sequence: 2,
        }),
      );
    });
  });
});
