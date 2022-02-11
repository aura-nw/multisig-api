import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetMultisigSignaturesParam {
    @ApiProperty({
        description: 'Tx Hash of multisig transaction',
        type: String,
    })
    @IsString()
    internalTxHash: string;
}