import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionRequest {
    @ApiProperty()
    from: string;

    @ApiProperty()
    to: string;

    @ApiProperty()
    amount: number;

    @ApiProperty()
    fee: number;

    @ApiProperty()
    gasLimit: number;

    @ApiProperty()
    internalChainId: number;

    @ApiProperty()
    bodyBytes: string;

    @ApiProperty()
    signature: string;

    @ApiProperty()
    creatorAddress: string;
}