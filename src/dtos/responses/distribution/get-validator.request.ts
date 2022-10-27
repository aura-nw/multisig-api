import { ApiProperty } from '@nestjs/swagger';

export class GetValidatorDetail {
  @ApiProperty({
    example: 21,
  })
  internalChainId: number;

  @ApiProperty({
    example: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
  })
  operatorAddress: string;
}
