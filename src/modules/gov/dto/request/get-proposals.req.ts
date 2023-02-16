import { ApiProperty } from '@nestjs/swagger';

export class GetProposalsParamDto {
  @ApiProperty({
    description: 'Internal Id of Chain',
    type: Number,
  })
  internalChainId: number;
}
