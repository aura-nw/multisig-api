import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { VALIDATOR_STATUS } from '../../../../common/constants/app.constant';

export class GetValidatorsParamDto {
  @ApiProperty({
    description: 'Internal Id of Chain',
    type: Number,
  })
  @IsString()
  internalChainId: number;
}

export class GetValidatorsQueryDto {
  @ApiPropertyOptional({
    description: 'Status of validators',
    type: VALIDATOR_STATUS,
  })
  @IsOptional()
  status: VALIDATOR_STATUS;
}