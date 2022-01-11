import { ResponseDto } from "src/dtos/responses/response.dto";
import { MODULE_REQUEST } from "src/module.config";

export interface ITransactionService {

    /**
     * create transaction
     * @param request
     */
    createTransaction(request: MODULE_REQUEST.CreateTransactionRequest): Promise<ResponseDto>;

    /**
     * single sign to a transaction
     * @param request
     */
    singleSignTransaction(request: MODULE_REQUEST.SingleSignTransactionRequest): Promise<ResponseDto>;

    /**
    * broadcast transaction
    * @param request
    */
    broadcastTransaction(request: MODULE_REQUEST.BroadcastTransactionRequest): Promise<ResponseDto>;

    /**
     * Get list of confirmation of Multisig Transaction
     * @param request
     */
    getListConfirmMultisigTransaction(internalTxHash: string): Promise<ResponseDto>;
}