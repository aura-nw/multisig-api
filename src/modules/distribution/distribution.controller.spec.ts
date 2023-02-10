import { Test, TestingModule } from '@nestjs/testing';
import { DistributionController } from './distribution.controller';
import { DistributionService } from './distribution.service';

describe('DistributionController', () => {
  let controller: DistributionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributionController],
      providers: [DistributionService],
    }).compile();

    controller = module.get<DistributionController>(DistributionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
