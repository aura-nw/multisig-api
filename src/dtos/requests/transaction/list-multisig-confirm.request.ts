import { ApiProperty } from "@nestjs/swagger";

export class ListMultisigConfirmRequest {
    @ApiProperty()
    multisigTransactionId: number;
}