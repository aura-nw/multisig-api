import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionRequest {
    @ApiProperty()
    from: string;

    @ApiProperty()
    to: string;

    @ApiProperty({type: 'float'})
    amount: number;

    @ApiProperty({type: 'float'})
    fee: number;

    @ApiProperty({type: 'float'})
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