import { ApiProperty } from "@nestjs/swagger";

export class GetAllTransactionsRequest {
    @ApiProperty()
    safeAddress: string;

    @ApiProperty()
    page: number;
}