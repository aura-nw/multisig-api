import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class PaginatorRequest {
  //@IsString()
  @ApiPropertyOptional()
  condition: any;

  // @IsString()
  @ApiPropertyOptional()
  order: any;

  @IsNumber()
  @ApiPropertyOptional()
  pageIndex = 0;

  @IsNumber()
  @ApiPropertyOptional()
  pageSize = 10;
}
