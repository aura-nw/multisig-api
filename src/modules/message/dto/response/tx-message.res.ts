import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { MultiSendInOutput } from './multi-send-inout';

export class TxMessageResponseDto {
  @Expose()
  @IsString()
  @ApiProperty({
    example: '/cosmos.staking.v1beta1.MsgDelegate',
  })
  typeUrl: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
  })
  fromAddress: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
  })
  toAddress: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
  })
  amount: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
  })
  delegatorAddress: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
  })
  validatorAddress: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
  })
  validatorSrcAddress: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
  })
  validatorDstAddress: string;

  @Expose()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 1 })
  voteOption: number;

  @Expose()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 140 })
  proposalId: number;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'aura1uyzpt9r0lmxwrrd73swnlxtqa8dj4jjy4qe2gy' })
  voter: string;

  @Expose()
  @ApiProperty({
    example: [
      {
        address: 'aura1qc4y4awjmx9zjzqapucr66tdzf34zq0uxjraf7',
        coins: [
          {
            denom: 'utaura',
            amount: '50000',
          },
        ],
      },
    ],
  })
  @Transform(({ value }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @Type(() => MultiSendInOutput)
  inputs: MultiSendInOutput[];

  @Expose()
  @ApiProperty({ example: '' })
  @Transform(({ value }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  outputs: MultiSendInOutput[];

  @Expose()
  @IsString()
  @ApiProperty({ example: 'aura1g7hlgpvw46jvh8yuhu7zj369ws3h02h2nd37dsfhmzwsndw6qe2qvkmh0s' })
  contractAddress: string;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'aura1agsqhsrnpgcf5wht50qe5zgt4rzkg4uml8urvh' })
  contractSender: string;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'aura1agsqhsrnpgcf5wht50qe5zgt4rzkg4uml8urvh' })
  contractFunction: string;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'aura1agsqhsrnpgcf5wht50qe5zgt4rzkg4uml8urvh' })
  contractArgs: string;
}
