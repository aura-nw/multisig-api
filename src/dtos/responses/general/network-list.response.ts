import { ApiProperty } from "@nestjs/swagger";

export class NetworkListResponse {
    @ApiProperty({
        example: 13
    })
    id: number;

    @ApiProperty({
        example: 'Aura Testnet'
    })
    name: string;

    @ApiProperty({
        example: 'https://rpc-testnet.aura.network'
    })
    rest: string;

    @ApiProperty({
        example: 'https://tendermint-testnet.aura.network'
    })
    rpc: string;

    @ApiProperty({
        example: 'aura-testnet'
    })
    chainId: string;

    @ApiProperty({
        example: 'uaura'
    })
    denom: string;

    @ApiProperty({
        example: 'aura'
    })
    prefix: string;
}