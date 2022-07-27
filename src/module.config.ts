import {
  ConfirmSafePathParams,
  ConfirmTransactionRequest,
  ConnectMultisigWalletRequest,
  CreateMultisigWalletRequest,
  CreateTransactionRequest,
  DeleteSafePathParams,
  GetAllTransactionsRequest,
  GetMultisigSignaturesParam,
  GetSafeBalancePathParams,
  GetSafeBalanceQuery,
  GetSafePathParams,
  GetSafeQuery,
  GetSafesByOwnerAddressParams,
  GetSafesByOwnerAddressQuery,
  GetTransactionDetailsParam,
  RejectTransactionRequest,
  SendTransactionRequest,
  GetAccountOnchainParam,
  QueryMessageRequest,
  ExecuteMessageRequest,
} from './dtos/requests';
import { AuthRequest } from './dtos/requests/auth/signin.request';
import {
  GetDelegationInformationParam,
  GetDelegationInformationQuery,
} from './dtos/requests/general/get-delegation-information.request';
import { GetDelegatorRewardsParam } from './dtos/requests/general/get-delegator-rewards.request';
import { GetValidatorsParam } from './dtos/requests/general/get-validators.request';
import {
  GetMultisigWalletResponse,
  MultisigSignatureResponse,
  MultisigTransactionHistoryResponse,
  NetworkListResponse,
  ResponseDto,
  TransactionDetailsResponse,
  GetAccountOnchainResponse,
  CreateSafeResponse,
  GetBalanceResponse,
} from './dtos/responses';
import { GetDelegationInformationResponse } from './dtos/responses/general/get-delegation-information.response';
import { GetDelegatorRewardsResponse } from './dtos/responses/general/get-delegator-rewards.response';
import {
  AuraTx,
  Chain,
  MultisigConfirm,
  MultisigTransaction,
  Safe,
  SafeOwner,
  SmartContractTx,
} from './entities';

export const ENTITIES_CONFIG = {
  SAFE: Safe,
  SAFE_OWNER: SafeOwner,
  CHAIN: Chain,
  MULTISIG_CONFIRM: MultisigConfirm,
  MULTISIG_TRANSACTION: MultisigTransaction,
  AURA_TX: AuraTx,
  SMART_CONTRACT_TX: SmartContractTx,
};

export const REQUEST_CONFIG = {
  CREATE_MULTISIG_WALLET_REQUEST: CreateMultisigWalletRequest,
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
  GET_ACCOUNT_ONCHAIN_PARAM: GetAccountOnchainParam,
  QUERY_MESSAGE_REQUEST: QueryMessageRequest,
  EXECUTE_MESSAGE_REQUEST: ExecuteMessageRequest,
  SIGN_IN_REQUEST: AuthRequest,
  GET_VALIDATORS_PARAM: GetValidatorsParam,
  GET_DELEGATOR_REWARDS_PARAM: GetDelegatorRewardsParam,
  GET_DELEGATION_INFORMATION_PARAM: GetDelegationInformationParam,
  GET_DELEGATION_INFORMATION_QUERY: GetDelegationInformationQuery,
};

export const RESPONSE_CONFIG = {
  RESPONSE_DTO: ResponseDto,
  MULTISIG_SIGNATURE_RESPONSE: MultisigSignatureResponse,
  CREATE_SAFE_RESPONSE: CreateSafeResponse,
  GET_SAFE_BALANCE: GetBalanceResponse,
  GET_MULTISIG_WALLET_RESPONSE: GetMultisigWalletResponse,
  MULTISIG_TRANSACTION_HISTORY_RESPONSE: MultisigTransactionHistoryResponse,
  TRANSACTION_DETAILS_RESPONSE: TransactionDetailsResponse,
  NETWORK_LIST_RESPONSE: NetworkListResponse,
  GET_ACCOUNT_ONCHAIN_RESPONSE: GetAccountOnchainResponse,
  GET_DELEGATOR_REWARDS_RESPONSE: GetDelegatorRewardsResponse,
  GET_DELEGATION_INFORMATION_RESPONSE: GetDelegationInformationResponse,
};

export namespace MODULE_REQUEST {
  export abstract class CreateMultisigWalletRequest extends REQUEST_CONFIG.CREATE_MULTISIG_WALLET_REQUEST {}
  export abstract class CreateTransactionRequest extends REQUEST_CONFIG.CREATE_TRANSACTION_REQUEST {}
  export abstract class SendTransactionRequest extends REQUEST_CONFIG.SEND_TRANSACTION_REQUEST {}
  export abstract class ConfirmTransactionRequest extends REQUEST_CONFIG.CONFIRM_TRANSACTION_REQUEST {}
  export abstract class ConnectMultisigWalletRequest extends REQUEST_CONFIG.CONNECT_WALLET_TO_GET_INFORMATION {}
  export abstract class GetSafeQuery extends REQUEST_CONFIG.GET_SAFE_QUERY {}
  export abstract class GetSafesByOwnerAddressQuery extends REQUEST_CONFIG.GET_SAFES_BY_OWNER_QUERY {}
  export abstract class GetSafePathParams extends REQUEST_CONFIG.GET_SAFE_PATH_PARAMS {}
  export abstract class ConfirmSafePathParams extends REQUEST_CONFIG.CONFIRM_SAFE_PATH_PARAMS {}
  export abstract class DeleteSafePathParams extends REQUEST_CONFIG.DELETE_SAFE_PATH_PARAMS {}
  export abstract class GetSafesByOwnerAddressParams extends REQUEST_CONFIG.GET_SAFES_BY_OWNER_PARAM {}
  export abstract class GetAllTransactionsRequest extends REQUEST_CONFIG.GET_ALL_TRANSACTION_REQUEST {}
  export abstract class GetTransactionDetailsParam extends REQUEST_CONFIG.GET_TRANSACTION_DETAILS_PARAM {}
  export abstract class RejectTransactionParam extends REQUEST_CONFIG.REJECT_TRANSACTION_PARAM {}
  export abstract class GetMultisigSignaturesParam extends REQUEST_CONFIG.GET_MULTISIG_SIGNATURES_PARAM {}
  export abstract class GetSafeBalanceQuery extends REQUEST_CONFIG.GET_SAFE_BALANCE_QUERY {}
  export abstract class GetSafeBalancePathParams extends REQUEST_CONFIG.GET_SAFE_BALANCE_PATH_PARAMS {}
  export abstract class GetAccountOnchainParam extends REQUEST_CONFIG.GET_ACCOUNT_ONCHAIN_PARAM {}
  export abstract class GetValidatorsParam extends REQUEST_CONFIG.GET_VALIDATORS_PARAM {}
  export abstract class GetDelegatorRewardsParam extends REQUEST_CONFIG.GET_DELEGATOR_REWARDS_PARAM {}
  export abstract class GetDelegationInformationParam extends REQUEST_CONFIG.GET_DELEGATOR_REWARDS_PARAM {}
  export abstract class GetDelegationInformationQuery extends REQUEST_CONFIG.GET_DELEGATION_INFORMATION_QUERY {}
  export abstract class QueryMessageRequest extends REQUEST_CONFIG.QUERY_MESSAGE_REQUEST {}
  export abstract class ExecuteMessageRequest extends REQUEST_CONFIG.EXECUTE_MESSAGE_REQUEST {}
  export abstract class AuthRequest extends REQUEST_CONFIG.SIGN_IN_REQUEST {}
}

export namespace MODULE_RESPONSE {
  export abstract class ResponseDto extends RESPONSE_CONFIG.RESPONSE_DTO {}
  export abstract class CreateSafeResponse extends RESPONSE_CONFIG.CREATE_SAFE_RESPONSE {}
  export abstract class GetSafeBalanceResponse extends RESPONSE_CONFIG.GET_SAFE_BALANCE {}
  export abstract class GetMultisigWalletResponse extends RESPONSE_CONFIG.GET_MULTISIG_WALLET_RESPONSE {}
  export abstract class MultisigSignatureResponse extends RESPONSE_CONFIG.MULTISIG_SIGNATURE_RESPONSE {}
  export abstract class MultisigTransactionHistoryResponse extends RESPONSE_CONFIG.MULTISIG_TRANSACTION_HISTORY_RESPONSE {}
  export abstract class TransactionDetailsResponse extends RESPONSE_CONFIG.TRANSACTION_DETAILS_RESPONSE {}
  export abstract class NetworkListResponse extends RESPONSE_CONFIG.NETWORK_LIST_RESPONSE {}
  export abstract class GetAccountOnchainResponse extends RESPONSE_CONFIG.GET_ACCOUNT_ONCHAIN_RESPONSE {}
  export abstract class GetDelegatorRewardsResponse extends RESPONSE_CONFIG.GET_DELEGATOR_REWARDS_RESPONSE {}
  export abstract class GetDelegationInformationResponse extends RESPONSE_CONFIG.GET_DELEGATION_INFORMATION_RESPONSE {}
}

export const SERVICE_INTERFACE = {
  ISIMULATING_SERVICE: 'ISimulatingService',
  IMULTISIG_WALLET_SERVICE: 'IMultisigWalletService',
  ITRANSACTION_SERVICE: 'ITransactionService',
  IGENERAL_SERVICE: 'IGeneralService',
  IMULTISIG_TRANSACTION_SERVICE: 'IMultisigTransactionService',
  ISMART_CONTRACT_SERVICE: 'ISmartContractService',
  IAUTH_SERVICE: 'IAuthService',
};

export const REPOSITORY_INTERFACE = {
  IMULTISIG_WALLET_REPOSITORY: 'IMultisigWalletRepository',
  IMULTISIG_WALLET_OWNER_REPOSITORY: 'IMultisigWalletOwnerRepository',
  ITRANSACTION_REPOSITORY: 'ITransactionRepository',
  IGENERAL_REPOSITORY: 'IGeneralRepository',
  IMULTISIG_TRANSACTION_REPOSITORY: 'IMultisigTransactionsRepository',
  IMULTISIG_CONFIRM_REPOSITORY: 'IMultisigConfirmRepository',
  ISMART_CONTRACT_REPOSITORY: 'ISmartContractRepository',
};

export const PROVIDER_INTERFACE = {};
