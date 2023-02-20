import { ApiProperty } from '@nestjs/swagger';

export class GetValidatorsResponseDto {
  @ApiProperty({
    example: [
      {
        validator: 'Singapore',
        operatorAddress: 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx',
        status: 'BOND_STATUS_BONDED',
        description: {
          moniker: 'Staketab',
          identity: 'D55266E648F3F70B',
        },
        commission: {
          commission_rates: {
            rate: '1.000000000000000000',
            max_rate: '1.000000000000000000',
            max_change_rate: '1.000000000000000000',
          },
          update_time: '2022-07-08T11:03:26.918179185Z',
        },
        votingPower: {
          number: '16268779585',
          percentage: '33.30',
        },
        uptime: 100,
      },
      {
        validator: 'mynode',
        operatorAddress: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
        status: 'BOND_STATUS_BONDED',
        description: {
          moniker: 'Staketab',
          picture:
            'https://s3.amazonaws.com/keybase_processed_uploads/8b0c28b642e5dfcc2cba07bea1157e05_360_360.jpg',
        },
        commission: {
          commission_rates: {
            rate: '0.100000000000000000',
            max_rate: '0.200000000000000000',
            max_change_rate: '0.010000000000000000',
          },
          update_time: '2022-07-08T09:28:38.086398576Z',
        },
        votingPower: {
          number: '32589734807',
          percentage: '66.70',
        },
        uptime: 100,
      },
    ],
  })
  validators: GetValidatorsValidatorDto[];
}

export class GetValidatorsValidatorDto {
  validator: string;

  operatorAddress: string;

  status: string;

  votingPower: {
    number: string;
    percentage: string;
  };

  description: {
    moniker: string;
    picture: string;
  };

  commission: any;

  // participation:
  uptime: number;
}
