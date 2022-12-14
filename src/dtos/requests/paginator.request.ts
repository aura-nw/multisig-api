import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginatorRequest {
  //@IsString()
  @ApiPropertyOptional()
  @IsOptional()
  condition: any;

  // @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  order: any;

  @IsNumber()
  @ApiPropertyOptional()
  @IsOptional()
  pageIndex = 0;

  @IsNumber()
  @ApiPropertyOptional()
  @IsOptional()
  pageSize = 10;
}
