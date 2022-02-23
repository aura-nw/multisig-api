import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetMultisigSignaturesParam {
    @ApiProperty({
        description: 'Id of multisig transaction',
        type: Number,
    })
    @IsString()
    id: number;
}