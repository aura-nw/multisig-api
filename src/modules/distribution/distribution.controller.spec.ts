import { Test, TestingModule } from '@nestjs/testing';
import { DistributionController } from './distribution.controller';
import { DistributionService } from './distribution.service';
import { distributionTestingModule } from './distribution-testing.module';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { mockValidators } from './mocks';
import { GetValidatorsParamDto, GetValidatorsQueryDto } from './dto';
import { ValidatorStatus } from '../../common/constants/app.constant';

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
});
