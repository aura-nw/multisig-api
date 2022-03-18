import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConnectMultisigWalletRequest {
    @IsString()
    @ApiProperty()
    owner_address: string;

    @IsString()
    @ApiProperty()
    chainId: string;

    @IsString()
    @ApiProperty()
    safe_address: string;
}