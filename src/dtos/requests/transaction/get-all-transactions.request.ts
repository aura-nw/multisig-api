import { ApiProperty } from "@nestjs/swagger";

export class GetAllTransactionsRequest {
    @ApiProperty({
        example: 'aura16urhpn3xjcja0frv750ty3w62qd8skht7e3tlh'
    })
    safeAddress: string;

    @ApiProperty({
        example: true
    })
    isHistory: boolean;

    @ApiProperty({
        example: 10
    })
    pageSize: number;

    @ApiProperty({
        example: 1
    })
    pageIndex: number;
}