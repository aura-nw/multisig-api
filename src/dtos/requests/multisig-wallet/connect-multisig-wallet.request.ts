import { ApiProperty } from '@nestjs/swagger';

export class ConnectMultisigWalletRequest {
    @ApiProperty()
    owner_address: string;

    @ApiProperty()
    chainId: string;

    @ApiProperty()
    safe_address: string;
}