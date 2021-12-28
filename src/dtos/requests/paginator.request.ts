import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class PaginatorRequest{
    //@IsString()
    @ApiPropertyOptional()
    condition: any;

   // @IsString()
    @ApiPropertyOptional()
    order: any;

    @IsNumber()
    @ApiPropertyOptional()
    pageIndex: number = 0;

    @IsNumber()
    @ApiPropertyOptional()
    pageSize: number = 10;
}