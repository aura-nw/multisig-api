import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { networkList } from '../../mock/chain/chain.mock';
import { SharedModule } from '../../shared/shared.module';
import { Gas } from '../gas/entities/gas.entity';
import { GasRepository } from '../gas/gas.repository';
import { ChainController } from './chain.controller';
import { ChainRepository } from './chain.repository';
import { ChainService } from './chain.service';
import { Chain } from './entities/chain.entity';

describe('ChainController', () => {
  let controller: ChainController;
  let service: ChainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      controllers: [ChainController],
      providers: [
        ChainService,
        ChainRepository,
        GasRepository,
        {
          provide: getRepositoryToken(Chain),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Gas),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ChainController>(ChainController);
    service = module.get<ChainService>(ChainService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('showNetworkList', () => {
    it('should return an array of chains', async () => {
      const chains = networkList;
      const result = ResponseDto.response(ErrorMap.SUCCESSFUL, chains);

      jest
        .spyOn(service, 'showNetworkList')
        .mockImplementation(async () => result);

      expect(await controller.showNetworkList()).toBe(result);
    });
  });

  describe('getAccountOnchain', () => {
    it('should return an array of chains', async () => {
      const chains = networkList;
      const result = ResponseDto.response(ErrorMap.SUCCESSFUL, chains);

      jest
        .spyOn(service, 'showNetworkList')
        .mockImplementation(async () => result);

      expect(await controller.showNetworkList()).toBe(result);
    });
  });
});
