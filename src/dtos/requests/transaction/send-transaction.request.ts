import { ApiProperty } from '@nestjs/swagger';

export class SendTransactionRequest {
    @ApiProperty()
    transactionId: number;

    @ApiProperty()
    memo: string;
}