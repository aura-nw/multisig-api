import { ResponseDto } from 'src/dtos/responses/response.dto';
import { MODULE_REQUEST } from 'src/module.config';

export interface ITransactionService {
  /**
   * create transaction
   * @param request
   */
  createTransaction(
    request: MODULE_REQUEST.CreateTransactionRequest,
  ): Promise<ResponseDto>;

  /**
   * send transaction
   * @param request
   */
  sendTransaction(
    request: MODULE_REQUEST.SendTransactionRequest,
  ): Promise<ResponseDto>;

  /**
   * confirm transaction
   * @param request
   */
  confirmTransaction(
    request: MODULE_REQUEST.ConfirmTransactionRequest,
  ): Promise<ResponseDto>;

  /**
   * reject transaction
   * @param request 
   */
  rejectTransaction(
    request: MODULE_REQUEST.RejectTransactionParam,
  ): Promise<ResponseDto>;

  /**
   * Get list of confirmation of Multisig Transaction
   * @param request
   */
  getListConfirmMultisigTransaction(
    param: MODULE_REQUEST.GetTransactionDetailsParam
  ): Promise<ResponseDto>;

  /**
   * Get list of confirmation of Multisig Transaction by Id
   * @param request
   */
   getListConfirmMultisigTransactionById(
    id: number
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
    param: MODULE_REQUEST.GetTransactionDetailsParam
  ): Promise<ResponseDto>;
}
