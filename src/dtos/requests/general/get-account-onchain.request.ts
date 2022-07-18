import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetAccountOnchainParam {
  @ApiProperty({
    description: 'Safe Address',
    type: String,
  })
  @IsString()
  safeAddress: string;

  @ApiProperty({
    description: 'Internal Id of Chain',
    type: Number,
  })
  @IsString()
  internalChainId: number;
}
