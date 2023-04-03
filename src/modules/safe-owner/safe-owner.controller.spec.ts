import { Test, TestingModule } from '@nestjs/testing';
import { SafeOwnerController } from './safe-owner.controller';
import { SafeOwnerService } from './safe-owner.service';

describe('SafeOwnerController', () => {
  let controller: SafeOwnerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SafeOwnerController],
      providers: [SafeOwnerService],
    }).compile();

    controller = module.get<SafeOwnerController>(SafeOwnerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
