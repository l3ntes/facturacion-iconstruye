import { Module } from '@nestjs/common';
import { DteController } from './dte.controller';
import { DteIssuanceService } from './services/dte-issuance/dte-issuance.service';
import { DteStatusService } from './services/dte-status/dte-status.service';
import { EventBridgeService } from './eventbridge.service';
import { S3Service } from './services/s3.service';
import { DynamoDBService } from './services/dynamodb.service';
@Module({
  controllers: [DteController],
  providers: [
    DteIssuanceService,
    DteStatusService,
    EventBridgeService,
    S3Service,
    DynamoDBService,
  ],
})
export class DteModule {}
