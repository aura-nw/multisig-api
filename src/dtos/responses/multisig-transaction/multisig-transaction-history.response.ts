import { ApiProperty } from '@nestjs/swagger';
import {
  TRANSACTION_STATUS,
  TRANSFER_DIRECTION,
} from 'src/common/constants/app.constant';
import { MultisigConfirm } from 'src/entities/multisig-confirm.entity';
import { MultisigSignatureResponse } from './multisig-signature.response';

export class MultisigTransactionHistoryResponse {
  @ApiProperty({
    example: 1,
  })
  Id: number;

  @ApiProperty({
    example: '2022-02-24T09:44:52.935Z',
  })
  CreatedAt: Date;

  @ApiProperty({
    example: '2022-02-24T09:44:52.935Z',
  })
  UpdatedAt: Date;

  @ApiProperty({
    example: 'aura1q9j9kq4v7s88hkm6zhp67wt0kvnmar6lhj4xvf',
  })
  FromAddress: string;

  @ApiProperty({
    example: 'aura132akx9989canxuzkfjnrgxwyccfcmtfzhmflqm',
  })
  ToAddress: string;

  @ApiProperty({
    example: '0F85B74D9B5C960AB334211790D6BF38DC39799AAEF6212D9EE7318FA6DDD6F2',
  })
  TxHash: string;

  @ApiProperty({
    example: 100,
  })
  Amount: number;

  @ApiProperty({
    example: 'uaura',
  })
  Denom: string;

  @ApiProperty({
    example: '/cosmos.bank.v1beta1.MsgSend',
  })
  TypeUrl: string;

  @ApiProperty({
    example: TRANSACTION_STATUS.SUCCESS,
  })
  Status: string;

  @ApiProperty({
    example: TRANSFER_DIRECTION.OUTGOING,
  })
  Direction: string;

  @ApiProperty({
    type: [MultisigSignatureResponse],
    example: MultisigSignatureResponse,
  })
  Signatures: MultisigConfirm[];
}
