import { ConfigService } from '@nestjs/config';
import { TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { ValidatorStatus } from '../../common/constants/app.constant';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { IAccountInfo, IAccountUnbonding, IValidator } from '../../interfaces';
import {
  accountInfoIndexerMock,
  accountUnbondIndexerMock,
  chainList,
  validatorIndexerResponseMock,
} from '../../mock';
import { CommonService } from '../../shared/services';
import { IndexerClient } from '../../shared/services/indexer.service';
import { ChainRepository } from '../chain/chain.repository';
import { distributionTestingModule } from './distribution-testing.module';
import { DistributionService } from './distribution.service';
import {
  GetDelegationDto,
  GetDelegationResponseDto,
  GetDelegationsParamDto,
  GetDelegationsResponseDto,
  GetUndelegationsParamDto,
  GetUndelegationsResponseDto,
  GetValidatorDetailDto,
  GetValidatorsParamDto,
  GetValidatorsQueryDto,
  GetValidatorsResponseDto,
} from './dto';
import {
  delegationResponseMock,
  delegationsResponseMock,
  keyBaseResponseMock,
  keybaseUrlMock,
  mockValidators,
  UnDelegationsResponseMock,
  validatorInfoMock,
} from './mocks';

describe('ChainService', () => {
  let service: DistributionService;
  let chainRepo: ChainRepository;
  let configService: ConfigService;
  let commonSvc: CommonService;
  let indexerClient: IndexerClient;

  beforeEach(async () => {
    const module: TestingModule = await distributionTestingModule.compile();

    service = module.get<DistributionService>(DistributionService);
    configService = module.get<ConfigService>(ConfigService);
    chainRepo = module.get<ChainRepository>(ChainRepository);
    commonSvc = module.get<CommonService>(CommonService);
    indexerClient = module.get<IndexerClient>(IndexerClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getValidatorInfo', () => {
    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const param: GetValidatorDetailDto = {
        internalChainId: 22,
        operatorAddress: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
      };
      const expectedResult = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        validatorInfoMock,
      );

      jest
        .spyOn(chainRepo, 'findChain')
        .mockImplementation(async () => chainList[0]);

      jest
        .spyOn(indexerClient, 'getValidatorInfo')
        .mockImplementation(
          async () =>
            validatorIndexerResponseMock.validators[0] as unknown as IValidator,
        );

      jest.spyOn(configService, 'get').mockImplementation(() => keybaseUrlMock);
      jest
        .spyOn(commonSvc, 'requestGet')
        .mockImplementation(async () => keyBaseResponseMock);

      const result = await service.getValidatorInfo(param);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getValidators', () => {
    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const param: GetValidatorsParamDto = {
        internalChainId: 22,
      };

      const query: GetValidatorsQueryDto = {
        status: ValidatorStatus.BOND_STATUS_BONDED,
      };

      const expectedData = plainToInstance(GetValidatorsResponseDto, {
        validators: mockValidators,
      });
      const expectedResult = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        expectedData,
      );

      jest
        .spyOn(chainRepo, 'findChain')
        .mockImplementation(async () => chainList[0]);

      jest
        .spyOn(indexerClient, 'getValidators')
        .mockImplementation(
          async () =>
            validatorIndexerResponseMock.validators as unknown as IValidator[],
        );

      jest.spyOn(configService, 'get').mockImplementation(() => keybaseUrlMock);

      jest
        .spyOn(commonSvc, 'requestGet')
        .mockImplementation(async () => keyBaseResponseMock);

      const result = await service.getValidators(param, query);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getDelegation', () => {
    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const query: GetDelegationDto = {
        internalChainId: 22,
        operatorAddress: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
        delegatorAddress: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
      };

      const expectedData = plainToInstance(
        GetDelegationResponseDto,
        delegationResponseMock,
      );
      const expectedResult = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        expectedData,
      );

      jest
        .spyOn(chainRepo, 'findChain')
        .mockImplementation(async () => chainList[0]);

      jest
        .spyOn(indexerClient, 'getAccountInfo')
        .mockImplementation(
          async () => accountInfoIndexerMock as unknown as IAccountInfo,
        );

      jest
        .spyOn(indexerClient, 'getValidatorByOperatorAddress')
        .mockImplementation(
          async () =>
            validatorIndexerResponseMock.validators[0] as unknown as IValidator,
        );

      const result = await service.getDelegation(query);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getDelegations', () => {
    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const param: GetDelegationsParamDto = {
        internalChainId: 22,
        delegatorAddress: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
      };

      const expectedData = plainToInstance(
        GetDelegationsResponseDto,
        delegationsResponseMock,
      );
      const expectedResult = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        expectedData,
      );

      jest
        .spyOn(chainRepo, 'findChain')
        .mockImplementation(async () => chainList[0]);

      jest
        .spyOn(indexerClient, 'getAccountInfo')
        .mockImplementation(
          async () => accountInfoIndexerMock as unknown as IAccountInfo,
        );

      const result = await service.getDelegations(param);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUndelegations', () => {
    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const param: GetUndelegationsParamDto = {
        internalChainId: 22,
        delegatorAddress: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
      };

      const expectedData = plainToInstance(
        GetUndelegationsResponseDto,
        UnDelegationsResponseMock,
      );
      const expectedResult = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        expectedData,
      );

      jest
        .spyOn(chainRepo, 'findChain')
        .mockImplementation(async () => chainList[0]);

      jest
        .spyOn(indexerClient, 'getAccountUnBonds')
        .mockImplementation(
          async () =>
            accountUnbondIndexerMock.account_unbonding as unknown as IAccountUnbonding[],
        );

      const result = await service.getUndelegations(param);

      expect(result).toEqual(expectedResult);
    });
  });
});
