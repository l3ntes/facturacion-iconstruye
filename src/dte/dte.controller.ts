import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EventBridgeService } from './eventbridge.service';
import { EmitDteDto } from './dto/emit-dte.dto';
import { S3Service } from './services/s3.service';
import { DynamoDBService } from './services/dynamodb.service';

@Controller()
export class DteController {
  constructor(
    private readonly eventBridgeService: EventBridgeService,
    private readonly s3Service: S3Service,
    private readonly dynamoDBService: DynamoDBService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('emit')
  async emitDte(@Body() body: EmitDteDto): Promise<any> {
    const folio = Date.now().toString();
    await this.s3Service.uploadDteFile(folio, body);
    await this.dynamoDBService.saveDte(folio, body);
    await this.eventBridgeService.publishEvent('DTE.Emitted', {
      folio,
      ...body,
      timestamp: new Date().toISOString(),
    });

    return {
      message: 'DTE emitido correctamente y evento publicado',
      folio,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('status/:folio')
  async getStatus(@Param('folio') folio: string): Promise<any> {
    const item = await this.dynamoDBService.getDte(folio);
    if (!item) {
      return { folio, status: 'No encontrado' };
    }
    return {
      folio: item.folio,
      status: item.status,
      timestamp: item.timestamp,
    };
  }
}
