import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class TxMessageResponse {
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
}
