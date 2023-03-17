import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetContractStatusReqDto {
  @ApiProperty({
    description: 'Contract Address',
    type: String,
    example: 'aura154wtyd0cu59tr5rrsh6u8esd7h4dxt7jf2p0w4mx3mhakl0s3u2qwpdflk',
  })
  @IsString()
  contractAddress: string;
}
