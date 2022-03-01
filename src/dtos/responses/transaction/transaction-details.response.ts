import { ApiProperty } from "@nestjs/swagger";
import { TRANSACTION_STATUS, TRANSFER_DIRECTION } from "src/common/constants/app.constant";
import { MultisigConfirm } from "src/entities";
import { MultisigSignatureResponse } from "../multisig-transaction/multisig-signature.response";

export class TransactionDetailsResponse {
    @ApiProperty({
        example: 1
    })
    Id: number;

    @ApiProperty({
        example: '2022-02-24T09:44:52.935Z'
    })
    CreatedAt: Date;

    @ApiProperty({
        example: '2022-02-24T09:44:52.935Z'
    })
    UpdatedAt: Date;

    @ApiProperty({
        example: 'aura1q9j9kq4v7s88hkm6zhp67wt0kvnmar6lhj4xvf'
    })
    FromAddress: string;

    @ApiProperty({
        example: 'aura132akx9989canxuzkfjnrgxwyccfcmtfzhmflqm'
    })
    ToAddress: string;

    @ApiProperty({
        example: '0F85B74D9B5C960AB334211790D6BF38DC39799AAEF6212D9EE7318FA6DDD6F2'
    })
    TxHash: string;

    @ApiProperty({ 
        example: 100
    })
    Amount: number;

    @ApiProperty({
        example: 'uaura'
    })
    Denom: string;

    @ApiProperty({ 
        example: 65034
    })
    GasUsed: number;

    @ApiProperty({ 
        example: 80000
    })
    GasWanted: number;

    @ApiProperty({
        example: 'aura-testnet'
    })
    ChainId: string;

    @ApiProperty({
        example: TRANSACTION_STATUS.SUCCESS
    })
    Status: string;

    @ApiProperty({ 
        example: 3
    })
    ConfirmationsRequired: number;

    @ApiProperty({
        example: [{ OwnerAddress: "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5"}]
    })
    Signers: [];

    @ApiProperty({
        example: TRANSFER_DIRECTION.OUTGOING
    })
    Direction: string;

    @ApiProperty({
        type: [MultisigSignatureResponse],
        example: MultisigSignatureResponse
    })
    Confirmations: MultisigConfirm[];

    @ApiProperty({
        example: [{
            "id": 2,
            "createdAt": "2022-02-24T09:44:52.935Z",
            "updatedAt": "2022-02-24T09:44:52.935Z",
            "ownerAddress": "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5",
            "signature": "IIo33eqegxuCl/Nx9p0Bfhlvz1y+Qr1ZVeJHQVRX2e4EW0sotraMTUyEAb3pNbQ8cgkiwIimFf73yUapGoLnmw==",
            "status": "REJECT"
        }]
    })
    Rejectors: MultisigConfirm[];

    @ApiProperty({
        example: {
            "id": 3,
            "createdAt": "2022-02-24T09:44:52.935Z",
            "updatedAt": "2022-02-24T09:44:52.935Z",
            "ownerAddress": "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5",
            "signature": "IIo33eqegxuCl/Nx9p0Bfhlvz1y+Qr1ZVeJHQVRX2e4EW0sotraMTUyEAb3pNbQ8cgkiwIimFf73yUapGoLnmw==",
            "status": "SEND"
        }
    })
    Executor: MultisigConfirm[];
}