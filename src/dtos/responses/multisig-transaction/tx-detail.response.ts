import { ApiProperty } from '@nestjs/swagger';
import { TxMessageResponse } from '../message/tx-msg.response';

export class MultisigTxDetail {
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
    example: '50',
  })
  Fee: string;

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
  Confirmations: any[];

  @ApiProperty({
    example: [],
  })
  Rejectors: any[];

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
  Executor: any[];

  // @ApiProperty({
  //   example: [],
  // })
  // Signers: any[];

  @ApiProperty({
    example: [
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        fromAddress: null,
        toAddress: null,
        amount: null,
        delegatorAddress: 'aura1nqw4cla0k49yfzpa6afl32hracut6tvwldmuuk',
        validatorAddress: 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx',
        validatorSrcAddress: null,
        validatorDstAddress: null,
      },
    ],
  })
  Messages: TxMessageResponse[];

  @ApiProperty({
    example: 123,
  })
  AutoClaimAmount: number;

  @ApiProperty({
    example: '2022-02-24T09:44:52.935Z',
  })
  CreatedAt: Date;

  @ApiProperty({
    example: '2022-02-24T09:44:52.935Z',
  })
  UpdatedAt: Date;
}

export class TxDetailResponse {
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
    example: 'serenity-testnet-001',
  })
  ChainId: string;

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
  Confirmations: any[];

  @ApiProperty({
    example: 1,
  })
  ConfirmationsRequired: string;

  @ApiProperty({
    example: 'uaura',
  })
  Denom: number;

  @ApiProperty({
    example: 'OUTGOING',
  })
  Direction: string;

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
  Executor: any;

  @ApiProperty({
    example: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
  })
  FromAddress: string;

  @ApiProperty({
    example: 225,
  })
  GasPrice: number;

  @ApiProperty({
    example: '73566',
  })
  GasUsed: string;

  @ApiProperty({
    example: 90000,
  })
  GasWanted: number;

  @ApiProperty({
    example: [],
  })
  Rejectors: any[];

  // @ApiProperty({
  //   example: [],
  // })
  // Signers: any[];

  @ApiProperty({
    example: 'SUCCESS',
  })
  Status: string;

  @ApiProperty({
    example: 225,
  })
  ToAddress: 'aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8';

  @ApiProperty({
    example: 'E48F99E3A20753AC7078D3A3372A5BFA575687C52F0A598B73781010C044413C',
  })
  TxHash: string;

  @ApiProperty({
    example: [
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        fromAddress: null,
        toAddress: null,
        amount: null,
        delegatorAddress: 'aura1nqw4cla0k49yfzpa6afl32hracut6tvwldmuuk',
        validatorAddress: 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx',
        validatorSrcAddress: null,
        validatorDstAddress: null,
      },
    ],
  })
  Messages: TxMessageResponse[];
}
