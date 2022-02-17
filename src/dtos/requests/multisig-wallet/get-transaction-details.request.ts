import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetTransactionDetailsParam {
    @ApiProperty({
        description: 'Tx Hash of transaction',
        type: String,
    })
    @IsString()
    internalTxHash: string;
}