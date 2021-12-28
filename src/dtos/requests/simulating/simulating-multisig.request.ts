import { ApiProperty } from "@nestjs/swagger";

export class  SimulatingMultisigRequest {
   
    @ApiProperty({type: [String]})
    mnemonics: string[];

    @ApiProperty()
    fromAddress: string;

    @ApiProperty()
    toAddress: string;
}