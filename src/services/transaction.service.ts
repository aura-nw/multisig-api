import { ResponseDto } from 'src/dtos/responses';
import { MODULE_REQUEST } from 'src/module.config';

export interface ITransactionService {
  // /**
  //  * Get list of confirmation of Multisig Transaction
  //  * @param request
  //  */
  // getListMultisigConfirm(
  //   internalTxHash: string,
  //   status?: string,
  // ): Promise<ResponseDto>;

  /**
   * Get list of confirmation of Multisig Transaction by Id
   * @param request
   */
  getListMultisigConfirmById(
    param: MODULE_REQUEST.GetMultisigSignaturesParam,
  ): Promise<ResponseDto>;

  /**
   * Get Multisig Transaction History
   */
  getTransactionHistory(
    request: MODULE_REQUEST.GetAllTransactionsRequest,
  ): Promise<ResponseDto>;

  /**
   * Get detail of a transaction
   */
  getTransactionDetails(
    param: MODULE_REQUEST.GetTransactionDetailsParam,
  ): Promise<ResponseDto>;
}
