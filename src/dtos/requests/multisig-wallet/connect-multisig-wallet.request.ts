import { ApiProperty } from '@nestjs/swagger';

export class ConnectMultisigWalletRequest {
    @ApiProperty()
    safe_address: string;

    @ApiProperty()
    pubkeys: string;

    @ApiProperty()
    chainId: string;
}