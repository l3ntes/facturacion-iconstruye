import { Test, TestingModule } from '@nestjs/testing';
import { DteController } from './dte.controller';

describe('DteController', () => {
  let controller: DteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DteController],
    }).compile();

    controller = module.get<DteController>(DteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
