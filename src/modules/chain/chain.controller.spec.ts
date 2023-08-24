import { TestingModule } from '@nestjs/testing';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { chains } from '../../mock/chain/chain.mock';
import { chainTestingModule } from './chain-testing.module';
import { ChainController } from './chain.controller';
import { ChainService } from './chain.service';
import { plainToInstance } from 'class-transformer';
import { ChainDto } from './dto';

describe('ChainController', () => {
  let controller: ChainController;
  let service: ChainService;

  beforeEach(async () => {
    const module: TestingModule = await chainTestingModule.compile();

    controller = module.get<ChainController>(ChainController);
    service = module.get<ChainService>(ChainService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('showNetworkList', () => {
    it('should return information of a multisig account', async () => {
      const result = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        plainToInstance(ChainDto, chains),
      );

      jest
        .spyOn(service, 'showNetworkList')
        .mockImplementation(async () => result);

      expect(await controller.showNetworkList()).toBe(result);
    });
  });

  describe('getAccountOnchain', () => {
    it('should return an array of chains', async () => {
      const getAccountOnchainParamMock = {
        safeAddress: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
        internalChainId: 22,
      };

      const accountOnchainMock = {
        accountNumber: 41,
        sequence: 109,
      };

      const result = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        accountOnchainMock,
      );

      jest
        .spyOn(service, 'getAccountOnchain')
        .mockImplementation(async () => result);

      expect(
        await controller.getAccountOnchain(getAccountOnchainParamMock),
      ).toBe(result);
    });
  });
});
