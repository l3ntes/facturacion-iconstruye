import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class DteController {
  constructor() {}

  @UseGuards(JwtAuthGuard)
  @Post('emit')
  async emitDte(@Body() body: EmitDteDto): Promise<any> {
    // TODO: logica de emision real
    return {
      message: 'DTE emitido correctamente',
      data: body,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('status/:folio')
  async getStatus(@Param('folio') folio: string): Promise<any> {
    // TODO: logica de emision real
    return {
      folio,
      status: 'Procesado',
    };
  }
}
