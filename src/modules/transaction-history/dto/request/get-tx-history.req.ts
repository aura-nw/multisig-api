import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class GetAllTransactionsRequestDto {
  @IsString()
  @ApiProperty({
    example: 'aura16urhpn3xjcja0frv750ty3w62qd8skht7e3tlh',
  })
  safeAddress: string;

  @IsBoolean()
  @ApiProperty({
    example: true,
  })
  isHistory: boolean;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    example: 10,
  })
  pageSize: number;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    example: 1,
  })
  pageIndex: number;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    example: 13,
  })
  @Type(() => Number)
  internalChainId: number;
}
