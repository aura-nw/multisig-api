import { ApiProperty } from '@nestjs/swagger';

export class SendTransactionRequest {
    @ApiProperty({
        description: 'Offchain Transaction Id',
        example: 14
    })
    transactionId: number;

    @ApiProperty({
        description: 'Offchain Chain Id',
        example: 4
    })
    internalChainId: number;

    @ApiProperty({
        description: 'Owner who broadcast transaction',
        example: 'aura1l5k37zpxp3ukty282kn6r7kf8rqh7cve0ggq2w'
    })
    owner: string;
}