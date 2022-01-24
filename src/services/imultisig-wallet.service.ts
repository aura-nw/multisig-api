import { ResponseDto } from 'src/dtos/responses/response.dto';
import { MODULE_REQUEST } from 'src/module.config';

export interface IMultisigWalletService {
  /**
   * create multisig wallet
   * @param request
   */
  createMultisigWallet(
    request: MODULE_REQUEST.CreateMultisigWalletRequest,
    internalChainId?: number
  ): Promise<ResponseDto>;

  /**
   * get multisig wallet
   * @param safeId string - id/address of safe
   */
  getMultisigWallet(safeId: string): Promise<ResponseDto>;

  /**
   * Return Safes where the address is an owner
   * @param ownerAddress string
   */
  getMultisigWalletsByOwner(ownerAddress: string, internalChainId: number): Promise<ResponseDto>;

  /**
   * Connect to multisig wallet
   */
  connectMultisigWalletByAddress(request: MODULE_REQUEST.ConnectMultisigWalletRequest): Promise<ResponseDto>;
  /** 
   * Confirm
   * @param safeId string - id/address of safe
   * @param request
   */
  confirm(
    safeId: string,
    request: MODULE_REQUEST.ConfirmMultisigWalletRequest,
  ): Promise<ResponseDto>;

  /**
   * Delete pending multisig wallet
   * @param safeId string - id/address of safe
   * @param request
   */
  deletePending(
    safeId: string,
    request: MODULE_REQUEST.DeleteMultisigWalletRequest,
  ): Promise<ResponseDto>;
}
