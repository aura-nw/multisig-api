import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetTransactionDetailsParam {
    @ApiProperty({
        description: 'TxHash or TxId',
        type: String,
    })
    @IsString()
    internalTxHash: string;
}