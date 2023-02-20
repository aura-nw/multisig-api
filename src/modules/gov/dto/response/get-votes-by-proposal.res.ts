import { ApiProperty } from '@nestjs/swagger';

export class GetVotesByProposalIdResponseDto {
  @ApiProperty({
    example: [
      {
        voter: 'aura1me70qgn5clsrwzq3wy6gxtv3y0mjzrqwejslqg',
        txHash:
          'E3F13F5E2A894C8C7C5DA4057757E19325911CD7C833A680DBCB34280F6831C7',
        answer: 'VOTE_OPTION_YES',
        time: '2022-10-05T10:56:03.000Z',
      },
      {
        voter: 'aura1trqfuz89vxe745lmn2yfedt7d4xnpcpvltc86e',
        txHash:
          '7B638A76544D173A3C2FD56DDC9CBC9F48DECB939CC49656ECC8C2FBCC35EE0A',
        answer: 'VOTE_OPTION_NO_WITH_VETO',
        time: '2022-10-05T10:57:00.000Z',
      },
      {
        voter: 'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
        txHash:
          'BE243FE2A5F4802AC0320517766036A338A0DFFBFC684164E0393A318D9B01BC',
        answer: 'VOTE_OPTION_NO',
        time: '2022-10-05T10:58:26.000Z',
      },
    ],
  })
  votes: GetVotesVote[];

  @ApiProperty({
    example: 'aura1trqfuz89vxe745lmn2yfedt7d4xnpcpvltc86e',
  })
  nextKey: string;
}

export class GetVotesVote {
  voter: string;

  txHash: string;

  answer: string;

  time: string;
}
