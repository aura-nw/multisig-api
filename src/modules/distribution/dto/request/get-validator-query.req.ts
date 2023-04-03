import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ValidatorStatus } from '../../../../common/constants/app.constant';

export class GetValidatorsQueryDto {
  @ApiPropertyOptional({
    description: 'Status of validators',
    type: ValidatorStatus,
  })
  @IsOptional()
  status: ValidatorStatus;
}
