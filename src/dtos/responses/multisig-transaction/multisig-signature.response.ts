import { ApiProperty } from "@nestjs/swagger";

export class MultisigSignatureResponse {
    @ApiProperty({
        example: 1
    })
    id: number;

    @ApiProperty({
        example: '2022-02-24T09:44:52.935Z'
    })
    createdAt: Date;

    @ApiProperty({
        example: '2022-02-24T09:44:52.935Z'
    })
    updatedAt: Date;

    @ApiProperty({
        example: 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5'
    })
    ownerAddress: string;

    @ApiProperty({
        example: 'IIo33eqegxuCl/Nx9p0Bfhlvz1y+Qr1ZVeJHQVRX2e4EW0sotraMTUyEAb3pNbQ8cgkiwIimFf73yUapGoLnmw=='
    })
    signature: string;

    @ApiProperty({
        example: 'CONFIRM'
    })
    status: string;
}
