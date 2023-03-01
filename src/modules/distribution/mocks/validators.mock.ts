import { ValidatorInfoDto } from '../dto';

export const mockValidators: ValidatorInfoDto[] = [
  {
    validator: 'mynode',
    operatorAddress: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
    status: 'BOND_STATUS_BONDED',
    commission: {
      commission_rates: {
        rate: 10,
      },
    },
    description: {
      moniker: 'mynode',
      picture:
        'https://validator-logos.s3.ap-southeast-1.amazonaws.com/validator-default.svg',
    },
    votingPower: {
      number: '107861.988',
      percentage: '83.52',
    },
    uptime: 100,
  },
  {
    validator: 'Singapore',
    operatorAddress: 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx',
    status: 'BOND_STATUS_BONDED',
    commission: {
      commission_rates: {
        rate: 100,
      },
    },
    description: {
      moniker: 'Singapore',
      picture:
        'https://validator-logos.s3.ap-southeast-1.amazonaws.com/validator-default.svg',
    },
    votingPower: {
      number: '21286.885',
      percentage: '16.48',
    },
    uptime: 100,
  },
];
