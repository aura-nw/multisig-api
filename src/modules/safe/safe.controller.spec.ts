import { Test, TestingModule } from '@nestjs/testing';
import { SafeController } from './safe.controller';
import { SafeService } from './safe.service';

describe('SafeController', () => {
  let controller: SafeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SafeController],
      providers: [SafeService],
    }).compile();

    controller = module.get<SafeController>(SafeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
