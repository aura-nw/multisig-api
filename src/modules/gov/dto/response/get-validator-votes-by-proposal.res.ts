import { ApiProperty } from '@nestjs/swagger';
import { ValidatorVoteDetail } from './validator-vote-detail.dto';

export class GetValidatorVotesByProposalIdResponseDto {
  @ApiProperty({
    example: [
      {
        rank: '1',
        percent_voting_power: 66.700_134,
        validator_address: 'aura1edw4lwcz3esnlgzcw60ra8m38k3zygz2aewzcf',
        operator_address: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
        validator_identity: '',
        validator_name: 'mynode',
        answer: '',
        tx_hash: '',
        timestamp: '',
      },
      {
        rank: '2',
        percent_voting_power: 33.299_865,
        validator_address: 'aura1d3n0v5f23sqzkhlcnewhksaj8l3x7jey8hq0sc',
        operator_address: 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx',
        validator_identity: '',
        validator_name: 'Singapore',
        answer: '',
        tx_hash: '',
        timestamp: '',
      },
    ],
  })
  votes: ValidatorVoteDetail[];

  @ApiProperty({
    example: 'aura1trqfuz89vxe745lmn2yfedt7d4xnpcpvltc86e',
  })
  nextKey: string;
}