import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetTransactionDetailsParam {
    @ApiProperty({
        description: 'Tx Hash or Id of Transaction',
        type: String,
    })
    @IsString()
    internalTxHash: string;

    @ApiProperty({
        description: 'Safe Address correspond to Transaction',
        type: String,
    })
    @IsString()
    safeAddress: string;
}