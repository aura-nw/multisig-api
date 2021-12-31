import { ResponseDto } from 'src/dtos/responses/response.dto';
import { MODULE_REQUEST } from 'src/module.config';

export interface IMultisigWalletService {
  /**
   * create multisig wallet
   * @param request
   */
  createMultisigWallet(
    request: MODULE_REQUEST.CreateMultisigWalletRequest,
  ): Promise<ResponseDto>;

  /**
   * get multisig wallet
   * @param request
   */
  getMultisigWallet(address: string): Promise<ResponseDto>;
}
