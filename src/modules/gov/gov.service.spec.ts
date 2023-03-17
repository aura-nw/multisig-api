import { TestingModule } from '@nestjs/testing';
import { GovService } from './gov.service';
import { govTestingModule } from './gov-testing.module';
import { ChainRepository } from '../chain/chain.repository';
import { IndexerClient } from '../../shared/services';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import {
  chainDbMock,
  networkStatusIndexerMock,
  proposalsIndexerMock,
  voteIndexerMock,
} from '../../mock';
import { INetworkStatus, IProposal, IVotes } from '../../interfaces';
import { plainToInstance } from 'class-transformer';
import {
  GetProposalByIdDto,
  GetProposalsParamDto,
  GetProposalsResponseDto,
  GetVotesByProposalIdParamDto,
  GetVotesByProposalIdQueryDto,
  ProposalDetailDto,
} from './dto';
import {
  getProposalByIdResponseMock,
  getProposalsResponseMock,
  getVotesByProposalIdResponseMock,
} from './mocks';
import { VoteAnswer } from '../../common/constants/app.constant';

describe('GovService', () => {
  let service: GovService;
  let chainRepo: ChainRepository;
  let indexerClient: IndexerClient;

  beforeEach(async () => {
    const module: TestingModule = await govTestingModule.compile();

    service = module.get<GovService>(GovService);
    chainRepo = module.get<ChainRepository>(ChainRepository);
    indexerClient = module.get<IndexerClient>(IndexerClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProposals', () => {
    it(`should return list proposals`, async () => {
      const param: GetProposalsParamDto = {
        internalChainId: 22,
      };

      const expectedResult = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        plainToInstance(GetProposalsResponseDto, getProposalsResponseMock),
      );

      jest
        .spyOn(chainRepo, 'findChain')
        .mockImplementation(async () => chainDbMock[0]);

      jest
        .spyOn(indexerClient, 'getProposals')
        .mockImplementation(
          async () => proposalsIndexerMock.proposals as unknown as IProposal[],
        );

      const result = await service.getProposals(param);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProposalById', () => {
    it(`should return information of a proposal`, async () => {
      const param: GetProposalByIdDto = {
        internalChainId: 22,
        proposalId: 396,
      };

      const expectedResult = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        plainToInstance(ProposalDetailDto, getProposalByIdResponseMock),
      );

      jest
        .spyOn(chainRepo, 'findChain')
        .mockImplementation(async () => chainDbMock[0]);

      jest
        .spyOn(indexerClient, 'getProposal')
        .mockImplementation(
          async () => proposalsIndexerMock.proposals[0] as unknown as IProposal,
        );

      jest
        .spyOn(indexerClient, 'getNetwork')
        .mockImplementation(
          async () => networkStatusIndexerMock as unknown as INetworkStatus,
        );

      const result = await service.getProposalById(param);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getVotesByProposalId', () => {
    it(`should return list votes of a proposal`, async () => {
      const param: GetVotesByProposalIdParamDto = {
        internalChainId: 22,
        proposalId: 396,
      };

      const query: GetVotesByProposalIdQueryDto = {
        answer: VoteAnswer.VOTE_OPTION_YES,
        nextKey: '',
        pageOffset: 0,
        pageLimit: 45,
        reverse: false,
      };

      const expectedResult = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        plainToInstance(ProposalDetailDto, getVotesByProposalIdResponseMock),
      );

      jest
        .spyOn(chainRepo, 'findChain')
        .mockImplementation(async () => chainDbMock[0]);

      jest
        .spyOn(indexerClient, 'getVotesByProposalId')
        .mockImplementation(async () => voteIndexerMock as unknown as IVotes);

      jest
        .spyOn(indexerClient, 'getNetwork')
        .mockImplementation(
          async () => networkStatusIndexerMock as unknown as INetworkStatus,
        );

      const result = await service.getVotesByProposalId(param, query);

      expect(result).toEqual(expectedResult);
    });
  });
});
