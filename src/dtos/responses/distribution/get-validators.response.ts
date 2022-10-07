import { ApiProperty } from '@nestjs/swagger';

export class GetValidatorsResponse {
  @ApiProperty({
    example: [
      {
        validator: 'Singapore',
        operatorAddress: 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx',
        status: 'BOND_STATUS_BONDED',
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
  validators: GetValidatorsValidator[];
}

export class GetValidatorsValidator {
  validator: string;
  operatorAddress: string;
  status: string;
  votingPower: {
    number: string;
    percentage: string;
  };
  commission: any;
  // participation:
  uptime: number;
}
