import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockFactory } from '../../common/mock';
import { gasMock } from '../../mock';
import { Gas } from './entities/gas.entity';
import { GasRepository } from './gas.repository';
import { gasTestingModule } from './gas-testing.module';

describe('GasRepository', () => {
  let gasRepository: GasRepository;
  let mockRepo = MockFactory.getMock(Repository<Gas>);

  beforeEach(async () => {
    const module: TestingModule = await gasTestingModule
      .overrideProvider(getRepositoryToken(Gas))
      .useValue(mockRepo)
      .compile();

    gasRepository = module.get<GasRepository>(GasRepository);
  });

  it('should be defined', () => {
    expect(gasRepository).toBeDefined();
  });

  describe('findGasByChainId', () => {
    it('should return gas information by chain', async () => {
      mockRepo.find = jest.fn().mockResolvedValue(gasMock);

      expect(await gasRepository.findGasByChainId('aura-testnet-2')).toBe(
        gasMock,
      );
    });
  });
});
