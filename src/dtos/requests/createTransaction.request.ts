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
    chainId: number;
}