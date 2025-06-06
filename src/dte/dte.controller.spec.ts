import { Test, TestingModule } from '@nestjs/testing';
import { DteController } from './dte.controller';
import { EventBridgeService } from './eventbridge.service';
import { S3Service } from './services/s3.service';
import { DynamoDBService } from './services/dynamodb.service';
import { EmitDteDto } from './dto/emit-dte.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('DteController', () => {
  let controller: DteController;

  // Mocks
  const mockEventBridgeService = {
    publishEvent: jest.fn().mockResolvedValue({}),
  };

  const mockS3Service = {
    uploadDteFile: jest.fn().mockResolvedValue({}),
  };

  const mockDynamoDBService = {
    saveDte: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DteController],
      providers: [
        { provide: EventBridgeService, useValue: mockEventBridgeService },
        { provide: S3Service, useValue: mockS3Service },
        { provide: DynamoDBService, useValue: mockDynamoDBService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // bypass JWT guard
      .compile();

    controller = module.get<DteController>(DteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should emit DTE and return folio', async () => {
    const dto: EmitDteDto = {
      tipoDocumento: '33',
      receptorRUT: '11111111-1',
      monto: '100000',
    };

    const result = await controller.emitDte(dto);

    expect(result).toHaveProperty('folio');
    expect(typeof result.folio).toBe('string');
    expect(result.message).toContain('DTE emitido');

    // Verify mocks called
    expect(mockS3Service.uploadDteFile).toHaveBeenCalled();
    expect(mockDynamoDBService.saveDte).toHaveBeenCalled();
    expect(mockEventBridgeService.publishEvent).toHaveBeenCalled();
  });
});
