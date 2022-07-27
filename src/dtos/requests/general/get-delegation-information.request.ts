import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetDelegationInformationParam {
  @ApiProperty({
    description: 'Delegator Address',
    type: String,
  })
  delegatorAddress: string;

  @ApiProperty({
    description: 'Internal Id of Chain',
    type: Number,
  })
  internalChainId: number;
}

export class GetDelegationInformationQuery {
  @ApiPropertyOptional({
    description:
      'key is a value returned in PageResponse.next_key to begin querying the next page most efficiently.Only one of offset or key should be set.',
    type: String,
  })
  key: string;

  @ApiPropertyOptional({
    description:
      'offset is a numeric offset that can be used when key is unavailable. It is less efficient than using key. Only one of offset or key should be set.',
    type: Number,
  })
  offset: number;

  @ApiPropertyOptional({
    description:
      'limit is the total number of results to be returned in the result page. If left empty it will default to a value to be set by each app.',
    type: Number,
  })
  limit: number;

  @ApiPropertyOptional({
    description:
      'count_total is set to true to indicate that the result set should include a count of the total number of items available for pagination in UIs. count_total is only respected when offset is used. It is ignored when key is set.',
    type: Boolean,
  })
  countTotal: boolean;

  @ApiPropertyOptional({
    description:
      'reverse is set to true if results are to be returned in the descending order.',
    type: Boolean,
  })
  reverse: boolean;
}
