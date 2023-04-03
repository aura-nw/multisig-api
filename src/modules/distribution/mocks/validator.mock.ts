import { plainToInstance } from 'class-transformer';
import { GetValidatorInfoResDto } from '../dto';

export const validatorInfoMock = plainToInstance(GetValidatorInfoResDto, {
  internalChainId: 22,
  validator: 'mynode',
  operatorAddress: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
  status: 'BOND_STATUS_BONDED',
  picture:
    'https://validator-logos.s3.ap-southeast-1.amazonaws.com/validator-default.svg',
});
