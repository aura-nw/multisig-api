import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionRequest {
    @ApiProperty({
        description: 'Address of safe'
    })
    from: string;

    @ApiProperty({
        description: 'Address of receiver'
    })
    to: string;

    @ApiProperty({
        description: 'Transaction amount'
    })
    amount: number;

    @ApiProperty({
        description: 'Transaction fee'
    })
    fee: number;

    @ApiProperty({
        description: 'Transaction gas limit'
    })
    gasLimit: number;

    @ApiProperty({
        description: 'Chain Id'
    })
    internalChainId: number;

    @ApiProperty({
        description: 'Owner who create transaction must sign transaction via wallet first. Then get bodyBytes of result.'
    })
    bodyBytes: string;

    @ApiProperty({
        description: 'Owner who create transaction must sign transaction via wallet first. Then get signature of result.'
    })
    signature: string;

    @ApiProperty({
        description: 'Address of owner who create transaction',
    })
    creatorAddress: string;
}