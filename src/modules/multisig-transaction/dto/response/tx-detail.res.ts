import { ApiProperty } from '@nestjs/swagger';
import { TxMessageResponseDto } from '../../../message/dto/response/tx-message.res';
import { GetListConfirmResDto } from '../../../multisig-confirm/dto';

export class TxDetailDto {
  @ApiProperty({
    example: 1,
  })
  AuraTxId: number;

  @ApiProperty({
    example: 1,
  })
  MultisigTxId: number;

  @ApiProperty({
    example: 'xxxx',
  })
  TxHash: string;

  @ApiProperty({
    example: 'xxx',
  })
  RawMessages: string;

  @ApiProperty({
    example: '50',
  })
  Fee: string;

  @ApiProperty({
    example: '282500',
  })
  Gas: string;

  @ApiProperty({
    example: 'SUCCESS',
  })
  Status: string;

  @ApiProperty({
    example: 1,
  })
  ConfirmationsRequired: string;

  @ApiProperty({
    example: [
      {
        id: 1843,
        createdAt: '2022-08-09T03:48:20.515Z',
        updatedAt: '2022-08-09T03:48:20.515Z',
        ownerAddress: 'aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8',
        signature:
          'WQ1ox9UhZQdcEbSXCaRYM99XcxItsl8rHCVvUW/E7oQGaiN1MH6OluoWQLYGmNIjrhyVkQRY/Qf7a0N/Q9bR2w==',
        status: 'CONFIRM',
      },
    ],
  })
  Confirmations: GetListConfirmResDto[];

  @ApiProperty({
    example: [],
  })
  Rejectors: GetListConfirmResDto[];

  @ApiProperty({
    example: [
      {
        id: 1846,
        createdAt: '2022-08-09T03:56:05.398Z',
        updatedAt: '2022-08-09T03:56:05.398Z',
        ownerAddress: 'aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8',
        signature: '',
        status: 'SEND',
      },
    ],
  })
  Executor: GetListConfirmResDto;

  @ApiProperty({
    example: [
      {
        id: 1846,
        createdAt: '2022-08-09T03:56:05.398Z',
        updatedAt: '2022-08-09T03:56:05.398Z',
        ownerAddress: 'aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8',
        signature: '',
        status: 'DELETE',
      },
    ],
  })
  Deleter: GetListConfirmResDto;

  @ApiProperty({
    example: [
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        delegatorAddress: 'aura1nqw4cla0k49yfzpa6afl32hracut6tvwldmuuk',
        validatorAddress: 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx',
      },
    ],
  })
  Messages: TxMessageResponseDto[];

  @ApiProperty({
    example: 123,
  })
  AutoClaimAmount: number;

  @ApiProperty({
    example: '',
  })
  Logs: string;

  @ApiProperty({
    example: '2022-02-24T09:44:52.935Z',
  })
  CreatedAt: Date;

  @ApiProperty({
    example: '2022-02-24T09:44:52.935Z',
  })
  UpdatedAt: Date;

  @ApiProperty({
    example: '2022-02-24T09:44:52.935Z',
  })
  Timestamp: Date;
}
