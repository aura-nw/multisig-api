import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { MultisigConfirm } from "src/entities/multisig-confirm.entity";

export class MultisigTransactionHistoryResponse {
    @Expose()
    @ApiProperty()
    txHash: string;

    @Expose()
    @ApiProperty({ type: [Date] })
    createdAt: Date;

    @Expose()
    @ApiProperty({ type: [Date] })
    updatedAt: Date;

    @Expose()
    @ApiProperty({ type: [Float64Array] })
    amount: number;

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