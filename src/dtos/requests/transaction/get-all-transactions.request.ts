import { ApiProperty } from "@nestjs/swagger";

export class GetAllTransactionsRequest {
    @ApiProperty()
    safeAddress: string;

    @ApiProperty()
    pageSize: number = 0;

    @ApiProperty()
    pageIndex: number = 10;
}