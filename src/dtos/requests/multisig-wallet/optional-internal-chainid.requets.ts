import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class OptionalInternalChainId {
  @IsOptional()
  @ApiProperty()
  internalChainId: number;
}