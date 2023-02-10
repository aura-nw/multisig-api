import { Test, TestingModule } from '@nestjs/testing';
import { AuraTxController } from './aura-tx.controller';
import { AuraTxService } from './aura-tx.service';

describe('AuraTxController', () => {
  let controller: AuraTxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuraTxController],
      providers: [AuraTxService],
    }).compile();

    controller = module.get<AuraTxController>(AuraTxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
