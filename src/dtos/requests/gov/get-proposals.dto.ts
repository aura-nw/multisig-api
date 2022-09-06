import { ApiProperty } from '@nestjs/swagger';

export class GetProposalsParam {
  @ApiProperty({
    description: 'Internal Id of Chain',
    type: Number,
  })
  internalChainId: number;
}
