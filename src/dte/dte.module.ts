import { Module } from '@nestjs/common';
import { DteController } from './dte.controller';
import { DteIssuanceService } from './services/dte-issuance/dte-issuance.service';
import { DteStatusService } from './services/dte-status/dte-status.service';

@Module({
  controllers: [DteController],
  providers: [DteIssuanceService, DteStatusService]
})
export class DteModule {}
