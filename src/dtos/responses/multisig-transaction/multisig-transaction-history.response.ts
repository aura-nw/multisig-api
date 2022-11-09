import { ApiProperty } from '@nestjs/swagger';
import {
  TRANSACTION_STATUS,
  TRANSFER_DIRECTION,
} from '../../../common/constants/app.constant';

export class MultisigTransactionHistoryResponse {
  @ApiProperty({
    example: 1,
  })
  AuraTxId: number;

  @ApiProperty({
    example: 1,
  })
  MultisigTxId: number;

  @ApiProperty({
    example: '0F85B74D9B5C960AB334211790D6BF38DC39799AAEF6212D9EE7318FA6DDD6F2',
  })
  TxHash: string;

  @ApiProperty({
    example: '/cosmos.bank.v1beta1.MsgSend',
  })
  TypeUrl: string;

  @ApiProperty({
    example: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
  })
  FromAddress: string;

  @ApiProperty({
    example: 100,
  })
  AuraTxAmount: number;

  @ApiProperty({
    example: 100,
  })
  MultisigTxAmount: number;

  @ApiProperty({
    example: 100,
  })
  FinalAmount: number;

  @ApiProperty({
    example: 2,
  })
  Confirmations: number;

  @ApiProperty({
    example: 2,
  })
  Rejections: number;

  @ApiProperty({
    example: 2,
  })
  ConfirmationsRequired: number;

  @ApiProperty({
    example: TRANSACTION_STATUS.SUCCESS,
  })
  Status: string;

  @ApiProperty({
    example: '2022-02-24T09:44:52.935Z',
  })
  CreatedAt: Date;

  @ApiProperty({
    example: '2022-02-24T09:44:52.935Z',
  })
  UpdatedAt: Date;

  @ApiProperty({
    example: TRANSFER_DIRECTION.OUTGOING,
  })
  Direction: string;
}
