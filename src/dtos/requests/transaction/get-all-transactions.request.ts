import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";

export class GetAllTransactionsRequest {
    @IsString()
    @ApiProperty({
        example: 'aura16urhpn3xjcja0frv750ty3w62qd8skht7e3tlh'
    })
    safeAddress: string;

    @IsBoolean()
    @ApiProperty({
        example: true
    })
    isHistory: boolean;

    @IsNumber()
    @ApiProperty({
        example: 10
    })
    pageSize: number;

    @IsNumber()
    @ApiProperty({
        example: 1
    })
    pageIndex: number;

    @IsNumber()
    @ApiProperty({
        example: 13
    })
    internalChainId: number;
}