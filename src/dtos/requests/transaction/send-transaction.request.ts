import { ApiProperty } from '@nestjs/swagger';

export class SendTransactionRequest {
    @ApiProperty()
    from: string;

    @ApiProperty()
    to: string;

    @ApiProperty()
    amount: number;

    @ApiProperty()
    denom: string;

    @ApiProperty()
    fee: number;

    @ApiProperty()
    gasLimit: number;

    @ApiProperty()
    memo: string;
}