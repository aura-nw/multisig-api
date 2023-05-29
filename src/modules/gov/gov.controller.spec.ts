import { Test, TestingModule } from '@nestjs/testing';
import { GovController } from './gov.controller';
import { GovService } from './gov.service';

describe('GovController', () => {
  let controller: GovController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GovController],
      providers: [GovService],
    }).compile();

    controller = module.get<GovController>(GovController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
