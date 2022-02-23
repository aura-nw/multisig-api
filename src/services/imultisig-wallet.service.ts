import { ResponseDto } from 'src/dtos/responses/response.dto';
import { MODULE_REQUEST } from 'src/module.config';

export interface IMultisigWalletService {
  /**
   * create multisig wallet
   * @param request
   */
  createMultisigWallet(
    request: MODULE_REQUEST.CreateMultisigWalletRequest,
    internalChainId?: number,
  ): Promise<ResponseDto>;

  /**
   * get multisig wallet
   * @param safeId string - id/address of safe
   */
  getMultisigWallet(
    param: MODULE_REQUEST.GetSafePathParams,
    query: MODULE_REQUEST.GetSafeQuery,
  ): Promise<ResponseDto>;

  /**
   * get balance of multisig wallet
   * @param safeId string - id/address of safe
   */
  getBalance(
    param: MODULE_REQUEST.GetSafePathParams,
    query: MODULE_REQUEST.GetSafeQuery,
  ): Promise<ResponseDto>;

  /**
   * Return Safes where the address is an owner
   * @param ownerAddress string
   */
  getMultisigWalletsByOwner(
    param: MODULE_REQUEST.GetSafesByOwnerAddressParams,
    query: MODULE_REQUEST.GetSafesByOwnerAddressQuery,
  ): Promise<ResponseDto>;

  // /**
  //  * Connect to multisig wallet
  //  */
  // connectMultisigWalletByAddress(
  //   request: MODULE_REQUEST.ConnectMultisigWalletRequest,
  // ): Promise<ResponseDto>;
  /**
   * Confirm
   * @param safeId string - id/address of safe
   * @param request
   */
  confirm(
    param: MODULE_REQUEST.ConfirmSafePathParams,
    request: MODULE_REQUEST.ConfirmMultisigWalletRequest,
  ): Promise<ResponseDto>;

  /**
   * Delete pending multisig wallet
   * @param safeId string - id/address of safe
   * @param request
   */
  deletePending(
    param: MODULE_REQUEST.DeleteSafePathParams,
    request: MODULE_REQUEST.DeleteMultisigWalletRequest,
  ): Promise<ResponseDto>;
}
