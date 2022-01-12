import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { MultisigConfirm } from "src/entities/multisig-confirm.entity";

export class MultisigTransactionHistoryResponse {
    @Expose()
    @ApiProperty()
    txHash: string;

    @Expose()
    @ApiProperty({ type: 'timestamp', name: 'CreatedAt' })
    createdAt: Date;

    @Expose()
    @ApiProperty({ type: 'timestamp', name: 'UpdatedAt' })
    updatedAt: Date;

    @Expose()
    @ApiProperty({ type: [Float64Array] })
    amount: number;

    @Expose()
    @ApiProperty()
    denom: string;

    @Expose()
    @ApiProperty()
    sender: string;

    @Expose()
    @ApiProperty()
    receiver: string;

    @Expose()
    @ApiProperty()
    signatures: MultisigConfirm[];
}