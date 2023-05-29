import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetContractStatusReqDto {
  @ApiProperty({
    description: 'Contract Address',
    type: String,
    example: 'aura1t7sv20kw5vm8gkpzrak4qfmxxsktdc9ykdjay5kr5lr8frtskwwqdnd6re',
  })
  @IsString()
  contractAddress: string;
}
