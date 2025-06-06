import { Test, TestingModule } from '@nestjs/testing';
import { DteStatusService } from './dte-status.service';

describe('DteStatusService', () => {
  let service: DteStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DteStatusService],
    }).compile();

    service = module.get<DteStatusService>(DteStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
