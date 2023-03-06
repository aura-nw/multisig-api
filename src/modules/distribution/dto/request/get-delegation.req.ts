import { ApiProperty } from '@nestjs/swagger';

export class GetDelegationDto {
  @ApiProperty({
    example: 21,
  })
  internalChainId: number;

  @ApiProperty({
    example: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
  })
  operatorAddress: string;

  @ApiProperty({
    example: 'aura17vsg5vvsc554wst3p0paczcd7xyn5qdl5xmt9w',
  })
  delegatorAddress: string;
}
