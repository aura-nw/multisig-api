import { ApiProperty } from '@nestjs/swagger';

export class CreateMultisigWalletRequest {
    @ApiProperty()
    name: string;

    @ApiProperty({ type: [String] })
    pubkeys: string[];

    @ApiProperty()
    threshold: number;
}