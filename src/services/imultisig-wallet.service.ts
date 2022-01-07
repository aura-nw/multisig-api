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

  /**
   * Return Safes where the address is an owner
   * @param ownerAddress string
   */
  getMultisigWalletsByOwner(ownerAddress: string): Promise<ResponseDto>;

  /**
   * Connect to multisig wallet
   */
  connectMultisigWalletByAddress(request: MODULE_REQUEST.ConnectMultisigWalletRequest): Promise<ResponseDto>;
}
