import { Test, TestingModule } from '@nestjs/testing';
import { AuraTxService } from './aura-tx.service';

describe('AuraTxService', () => {
  let service: AuraTxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuraTxService],
    }).compile();

    service = module.get<AuraTxService>(AuraTxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
