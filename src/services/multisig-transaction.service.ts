import { ResponseDto } from 'src/dtos/responses/response.dto';
import { MODULE_REQUEST } from 'src/module.config';

export interface IMultisigTransactionService {
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
}
