import { IsString, IsNotEmpty } from 'class-validator';

export class EmitDteDto {
  @IsString()
  @IsNotEmpty()
  tipoDocumento: string;

  @IsString()
  @IsNotEmpty()
  receptorRUT: string;

  @IsString()
  @IsNotEmpty()
  monto: string;
}
