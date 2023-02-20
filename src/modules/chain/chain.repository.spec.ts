import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorMap } from '../../common/error.map';
import { MockFactory, MockType } from '../../common/mock';
import { mockChain } from '../../mock/safe.mock';
import { chainTestingModule } from './chain-testing.module';
import { ChainRepository } from './chain.repository';
import { Chain } from './entities/chain.entity';

describe('ChainRepository', () => {
  let chainRepository: ChainRepository;
  let mockRepo = MockFactory.getMock(Repository<Chain>);

  beforeEach(async () => {
    const module: TestingModule = await chainTestingModule
      .overrideProvider(getRepositoryToken(Chain))
      .useValue(mockRepo)
      .compile();

    chainRepository = module.get<ChainRepository>(ChainRepository);
  });

  it('should be defined', () => {
    expect(chainRepository).toBeDefined();
  });

  describe('showNetworkList', () => {
    it('should return information of a multisig account', async () => {
      mockRepo.find = jest.fn().mockResolvedValue(mockChain);

      expect(await chainRepository.showNetworkList()).toBe(mockChain);
    });
  });

  describe('findChain', () => {
    it(`should return error: ${ErrorMap.CHAIN_ID_NOT_EXIST.Message}`, async () => {
      const internalChainId = 22;
      mockRepo.findOne = jest.fn().mockResolvedValue(null);

      try {
        await chainRepository.findChain(internalChainId);
      } catch (error) {
        expect(error.errorMap.Message).toStrictEqual(
          ErrorMap.CHAIN_ID_NOT_EXIST.Message,
        );
      }
    });

    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const internalChainId = 22;
      mockRepo.findOne = jest.fn().mockResolvedValue(mockChain[0]);

      expect(await chainRepository.findChain(internalChainId)).toEqual(
        mockChain[0],
      );
    });
  });

  describe('findChainByChainId', () => {
    it(`should return error: ${ErrorMap.CHAIN_ID_NOT_EXIST.Message}`, async () => {
      const chainId = 'aura-testnet-2';
      mockRepo.findOne = jest.fn().mockResolvedValue(null);

      try {
        await chainRepository.findChainByChainId(chainId);
      } catch (error) {
        expect(error.errorMap.Message).toStrictEqual(
          ErrorMap.CHAIN_ID_NOT_EXIST.Message,
        );
      }
    });

    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const chainId = 'aura-testnet-2';
      mockRepo.findOne = jest.fn().mockResolvedValue(mockChain);

      expect(await chainRepository.findChainByChainId(chainId)).toEqual(
        mockChain,
      );
    });
  });

  // describe('createOrUpdate', () => {
  //   const chainInfos = [
  //     {
  //       name: 'Aura Devnet',
  //       rest: 'https://lcd.dev.aura.network/',
  //       rpc: 'https://rpc.dev.aura.network/',
  //       webSocket: 'https://explorer.dev.aura.network',
  //       explorer,
  //       symbol,
  //       denom,
  //       chainId,
  //       prefix,
  //       coinDecimals,
  //       gasPrice,
  //       tokenImg
  //     }
  //   ]
  // })
});
