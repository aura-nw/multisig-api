import { Pubkey } from "@cosmjs/amino";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class GetAccountOnchainResponse {
    @IsString()
    @ApiProperty({
        example: 'aura1r2gv6rx0fxdmepu8gd2gmn5j8cjetkqrw836x5'
    })
    address: string;

    @IsString()
    @ApiProperty({
        example: {
            type: 'tendermint/PubKeyMultisigThreshold',
            value: {
                threshold: 1,
                pubkeys: [
                    {
                        type: 'tendermint/PubKeySecp256k1',
                        value: 'AwGiaDuo6ICUpXpZy7Ii/P4QnZWrC2+fvBvF6f+3r4f8'
                    }
                ]
            }
        }
    })
    pubkey: Pubkey;

    @IsNumber()
    @ApiProperty({
        example: 39
    })
    accountNumber: number;

    @IsNumber()
    @ApiProperty({
        example: 13
    })
    sequence: number;
}