import { ConfirmMultisigWalletRequest, ConfirmSafePathParams, ConfirmTransactionRequest, ConnectMultisigWalletRequest, CreateMultisigWalletRequest, CreateTransactionRequest, DeleteMultisigWalletRequest, DeleteSafePathParams, GetAllTransactionsRequest, GetMultisigSignaturesParam, GetSafeBalancePathParams, GetSafeBalanceQuery, GetSafePathParams, GetSafeQuery, GetSafesByOwnerAddressParams, GetSafesByOwnerAddressQuery, GetTransactionDetailsParam, RejectTransactionRequest, SendTransactionRequest } from "./dtos/requests";
import { GetMultisigWalletResponse, MultisigSignatureResponse, MultisigTransactionHistoryResponse, NetworkListResponse, ResponseDto, TransactionDetailsResponse } from "./dtos/responses";
import { AuraTx, Chain, MultisigConfirm, MultisigTransaction, Safe, SafeOwner } from "./entities";


export const ENTITIES_CONFIG = {
  SAFE: Safe,
  SAFE_OWNER: SafeOwner,
  MULTISIG_TRANSACTION: MultisigTransaction,
  MULTISIG_CONFIRM: MultisigConfirm,
  CHAIN: Chain,
  MULTISIG_CONFIRM: MultisigConfirm,
  MULTISIG_TRANSACTION: MultisigTransaction,
  AURA_TX: AuraTx,
};

export const REQUEST_CONFIG = {
  CREATE_MULTISIG_WALLET_REQUEST: CreateMultisigWalletRequest,
  CONFIRM_MULTISIG_WALLET_REQUEST: ConfirmMultisigWalletRequest,
  DELETE_MULTISIG_WALLET_REQUEST: DeleteMultisigWalletRequest,
  CREATE_TRANSACTION_REQUEST: CreateTransactionRequest,
  SEND_TRANSACTION_REQUEST: SendTransactionRequest,
  CONFIRM_TRANSACTION_REQUEST: ConfirmTransactionRequest,
  CONNECT_WALLET_TO_GET_INFORMATION: ConnectMultisigWalletRequest,
  GET_SAFE_QUERY: GetSafeQuery,
  GET_SAFE_BALANCE_QUERY: GetSafeBalanceQuery,
  GET_SAFES_BY_OWNER_QUERY: GetSafesByOwnerAddressQuery,
  GET_SAFE_PATH_PARAMS: GetSafePathParams,
  GET_SAFE_BALANCE_PATH_PARAMS: GetSafeBalancePathParams,
  CONFIRM_SAFE_PATH_PARAMS: ConfirmSafePathParams,
  DELETE_SAFE_PATH_PARAMS: DeleteSafePathParams,
  GET_SAFES_BY_OWNER_PARAM: GetSafesByOwnerAddressParams,
  GET_ALL_TRANSACTION_REQUEST: GetAllTransactionsRequest,
  GET_TRANSACTION_DETAILS_PARAM: GetTransactionDetailsParam,
  REJECT_TRANSACTION_PARAM: RejectTransactionRequest,
  GET_MULTISIG_SIGNATURES_PARAM: GetMultisigSignaturesParam,
};

export const RESPONSE_CONFIG = {
  RESPONSE_DTO: ResponseDto,
  MULTISIG_SIGNATURE_RESPONSE: MultisigSignatureResponse,
  MULTISIG_TRANSACTION_HISTORY_RESPONSE: MultisigTransactionHistoryResponse,
  TRANSACTION_DETAILS_RESPONSE: TransactionDetailsResponse,
  NETWORK_LIST_RESPONSE: NetworkListResponse,
  MULTISIG_SIGNATURE_RESPONE: MultisigSignatureResponse,
  GET_MULTISIG_WALLET_RESPONSE: GetMultisigWalletResponse,
}

export module MODULE_REQUEST {
  export abstract class CreateMultisigWalletRequest extends REQUEST_CONFIG.CREATE_MULTISIG_WALLET_REQUEST { }
  export abstract class ConfirmMultisigWalletRequest extends REQUEST_CONFIG.CONFIRM_MULTISIG_WALLET_REQUEST { }
  export abstract class DeleteMultisigWalletRequest extends REQUEST_CONFIG.DELETE_MULTISIG_WALLET_REQUEST { }
  export abstract class CreateTransactionRequest extends REQUEST_CONFIG.CREATE_TRANSACTION_REQUEST { }
  export abstract class SendTransactionRequest extends REQUEST_CONFIG.SEND_TRANSACTION_REQUEST { }
  export abstract class SingleSignTransactionRequest extends REQUEST_CONFIG.SINGLE_SIGN_TRANSACTION_REQUEST { }
  export abstract class ConnectMultisigWalletRequest extends REQUEST_CONFIG.CONNECT_WALLET_TO_GET_INFORMATION { }
  export abstract class GetSafeQuery extends REQUEST_CONFIG.GET_SAFE_QUERY { }
  export abstract class GetSafeBalanceQuery extends REQUEST_CONFIG.GET_SAFE_BALANCE_QUERY { }
  export abstract class GetSafesByOwnerAddressQuery extends REQUEST_CONFIG.GET_SAFES_BY_OWNER_QUERY { }
  export abstract class GetSafePathParams extends REQUEST_CONFIG.GET_SAFE_PATH_PARAMS { }
  export abstract class GetSafeBalancePathParams extends REQUEST_CONFIG.GET_SAFE_BALANCE_PATH_PARAMS { }
  export abstract class ConfirmSafePathParams extends REQUEST_CONFIG.CONFIRM_SAFE_PATH_PARAMS { }
  export abstract class DeleteSafePathParams extends REQUEST_CONFIG.DELETE_SAFE_PATH_PARAMS { }
  export abstract class GetSafesByOwnerAddressParams extends REQUEST_CONFIG.GET_SAFES_BY_OWNER_PARAM { }
  export abstract class GetAllTransactionsRequest extends REQUEST_CONFIG.GET_ALL_TRANSACTION_REQUEST { }
  export abstract class GetMultisigSignaturesParam extends REQUEST_CONFIG.GET_MULTISIG_SIGNATURES_PARAM { }
}

export module MODULE_RESPONSE {
  export abstract class ResponseDto extends RESPONSE_CONFIG.RESPONSE_DTO { }
  export abstract class MultisigSignatureResponse extends RESPONSE_CONFIG.MULTISIG_SIGNATURE_RESPONSE { }
  export abstract class MultisigTransactionHistoryResponse extends RESPONSE_CONFIG.MULTISIG_TRANSACTION_HISTORY_RESPONSE { }
  export abstract class TransactionDetailsResponse extends RESPONSE_CONFIG.TRANSACTION_DETAILS_RESPONSE { }
  export abstract class NetworkListResponse extends RESPONSE_CONFIG.NETWORK_LIST_RESPONSE { }
  export abstract class MultisigSignatureRespone extends RESPONSE_CONFIG.MULTISIG_SIGNATURE_RESPONE { }
  export abstract class GetMultisigWalletResponse extends RESPONSE_CONFIG.GET_MULTISIG_WALLET_RESPONSE { }
}

export const SERVICE_INTERFACE = {
  ISIMULATING_SERVICE: 'ISimulatingService',
  IMULTISIG_WALLET_SERVICE: 'IMultisigWalletService',
  ITRANSACTION_SERVICE: 'ITransactionService',
  IGENERAL_SERVICE: 'IGeneralService',
};

export const REPOSITORY_INTERFACE = {
  IMULTISIG_WALLET_REPOSITORY: 'IMultisigWalletRepository',
  IMULTISIG_WALLET_OWNER_REPOSITORY: 'IMultisigWalletOwnerRepository',
  ITRANSACTION_REPOSITORY: 'ITransactionRepository',
  IGENERAL_REPOSITORY: 'IGeneralRepository',
  IMULTISIG_TRANSACTION_REPOSITORY: 'IMultisigTransactionsRepository',
  IMULTISIG_CONFIRM_REPOSITORY: 'IMultisigConfirmRepository',
  ISAFE_REPOSITORY: 'ISafeRepository',
};

export const PROVIDER_INTERFACE = {};
