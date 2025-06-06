import { Test, TestingModule } from '@nestjs/testing';
import { DteIssuanceService } from './dte-issuance.service';

describe('DteIssuanceService', () => {
  let service: DteIssuanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DteIssuanceService],
    }).compile();

    service = module.get<DteIssuanceService>(DteIssuanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
