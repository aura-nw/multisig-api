import { Test, TestingModule } from '@nestjs/testing';
import { SafeService } from './safe.service';

describe('SafeService', () => {
  let service: SafeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SafeService],
    }).compile();

    service = module.get<SafeService>(SafeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
