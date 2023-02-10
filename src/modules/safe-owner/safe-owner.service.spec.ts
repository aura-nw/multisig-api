import { Test, TestingModule } from '@nestjs/testing';
import { SafeOwnerService } from './safe-owner.service';

describe('SafeOwnerService', () => {
  let service: SafeOwnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SafeOwnerService],
    }).compile();

    service = module.get<SafeOwnerService>(SafeOwnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
