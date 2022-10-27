import { ApiProperty } from '@nestjs/swagger';

export class GetValidatorDetailResponse {
  @ApiProperty({
    example: 21,
  })
  internalChainId: number;

  @ApiProperty({
    example: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
  })
  operatorAddress: string;

  @ApiProperty({
    example: 'cantho',
  })
  validator: string;

  @ApiProperty({
    example: 'BOND_STATUS_BONDED',
  })
  status: string;

  @ApiProperty({
    example: '',
  })
  picture: string;
}
