import { Test, TestingModule } from '@nestjs/testing';
import { DistributionController } from './distribution.controller';
import { DistributionService } from './distribution.service';
import { distributionTestingModule } from './distribution-testing.module';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import {
  delegationResponseMock,
  delegationsResponseMock,
  mockValidators,
  UnDelegationsResponseMock,
  validatorInfoMock,
} from './mocks';
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
} from './dto';
import { ValidatorStatus } from '../../common/constants/app.constant';
import { plainToInstance } from 'class-transformer';

describe('DistributionController', () => {
  let controller: DistributionController;
  let service: DistributionService;

  beforeEach(async () => {
    const module: TestingModule = await distributionTestingModule.compile();

    controller = module.get<DistributionController>(DistributionController);
    service = module.get<DistributionService>(DistributionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getValidators', () => {
    it('should return list of validators', async () => {
      const params: GetValidatorsParamDto = {
        internalChainId: 22,
      };
      const query: GetValidatorsQueryDto = {
        status: ValidatorStatus.BOND_STATUS_BONDED,
      };
      const result = ResponseDto.response(ErrorMap.SUCCESSFUL, {
        validators: mockValidators,
      });

      jest
        .spyOn(service, 'getValidators')
        .mockImplementation(async () => result);

      expect(await controller.getValidators(params, query)).toBe(result);
    });
  });

  describe('getValidator', () => {
    it('should return validator detail', async () => {
      const param: GetValidatorDetailDto = {
        internalChainId: 22,
        operatorAddress: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
      };

      const expectedResult = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        validatorInfoMock,
      );

      jest
        .spyOn(service, 'getValidatorInfo')
        .mockImplementation(async () => expectedResult);

      expect(await controller.getValidator(param)).toBe(expectedResult);
    });
  });

  describe('getDelegations', () => {
    it('should return all delegations of a user', async () => {
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
        .spyOn(service, 'getDelegations')
        .mockImplementation(async () => expectedResult);

      expect(await controller.getDelegations(param)).toBe(expectedResult);
    });
  });

  describe('getDelegation', () => {
    it('should return single validator info and delegation from user', async () => {
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
        .spyOn(service, 'getDelegation')
        .mockImplementation(async () => expectedResult);

      expect(await controller.getDelegation(query)).toBe(expectedResult);
    });
  });

  describe('getUndelegations', () => {
    it('should return list undelegations of a user', async () => {
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
        .spyOn(service, 'getUndelegations')
        .mockImplementation(async () => expectedResult);

      expect(await controller.getUndelegations(param)).toBe(expectedResult);
    });
  });
});
