import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockFactory } from '../../common/mock';
import { AuraTxRepository } from './aura-tx.repository';
import { AuraTx } from './entities/aura-tx.entity';
import { auraTxTestingModule } from './aura-tx-testing.module';

describe('AuraTxRepository', () => {
  let auraTxRepository: AuraTxRepository;
  let mockRepo = MockFactory.getMock<Repository<AuraTx>>();

  beforeEach(async () => {
    const module: TestingModule = await auraTxTestingModule
      .overrideProvider(getRepositoryToken(AuraTx))
      .useValue(mockRepo)
      .compile();

    auraTxRepository = module.get<AuraTxRepository>(AuraTxRepository);
  });

  it('should be defined', () => {
    expect(auraTxRepository).toBeDefined();
  });

  describe('getAuraTxDetail', () => {
    const mockAuraTx = {
      AuraTxId: 121392,
      MultisigTxId: 1407,
      TxHash:
        'E6112B45EAB9EBADC5AC8ABBFD8DFC96915389F2BE95EEEB06F45F0C54F79D70',
      Fee: 50,
      Gas: 250000,
      Status: 'SUCCESS',
      Sequence: '85',
      CreatedAt: '2022-11-21T07:01:49.910Z',
      UpdatedAt: '2022-11-21T07:02:17.867Z',
      Timestamp: '2022-11-21T07:01:50.000Z',
      Messages: [
        {
          typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
          amount: '10000',
          delegatorAddress: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
          validatorAddress:
            'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
        },
      ],
      Confirmations: [
        {
          id: 3215,
          createdAt: '2022-11-21T07:01:49.953Z',
          updatedAt: '2022-11-21T07:01:49.953Z',
          ownerAddress: 'aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8',
          signature:
            'IkRKDPSzy3Hyes/Sm524PTstUD4akmA4Yk8rFI8/Ix5/Zvpd/pRkLfuo7fGkJJDNcDpy+L31k430GVDtKpTZug==',
          status: 'CONFIRM',
        },
      ],
      Rejectors: [],
      Executor: {
        id: 3216,
        createdAt: '2022-11-21T07:01:53.640Z',
        updatedAt: '2022-11-21T07:01:53.640Z',
        ownerAddress: 'aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8',
        signature: '',
        status: 'SEND',
      },
      AutoClaimAmount: 1039799,
      ConfirmationsRequired: 1,
    };

    it('should return information of a aura transaction', async () => {
      mockRepo.createQueryBuilder = jest.fn(() => ({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockAuraTx),
      }));

      expect(await auraTxRepository.getAuraTxDetail(121392)).toBe(mockAuraTx);
    });
  });
});
