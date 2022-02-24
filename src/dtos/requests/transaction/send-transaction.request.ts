import { ApiProperty } from '@nestjs/swagger';

export class SendTransactionRequest {
    @ApiProperty({
        description: 'Offchain Transaction Id'
    })
    transactionId: number;

    @ApiProperty({
        description: 'Chain Id'
    })
    internalChainId: number;

    @ApiProperty({
        description: 'Owner who broadcast transaction'
    })
    owner: string;
}