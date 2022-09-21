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
  GetTxDetailQuery,
  GetProposalsParam,
  GetProposalValidatorVotesByIdPathParams,
  GetProposalDepositsByIdPathParams,
  GetUserPathParam,
} from './dtos/requests';
import { AuthRequest } from './dtos/requests/auth/signin.request';
import {
  GetDelegationInformationParam,
  GetDelegationInformationQuery,
  GetDelegatorRewardsParam,
  GetUndelegationsParam,
} from './dtos/requests/distribution';
import {
  GetProposalDetailsParam,
  GetProposalsQuery,
  GetValidatorsParam,
} from './dtos/requests/general';
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
import { GetDelegationsResponse } from './dtos/responses/distribution/get-delegations.response';
import { GetUndelegationsResponse } from './dtos/responses/distribution/get-undelegations.response';
import { GetValidatorsResponse } from './dtos/responses/distribution/get-validators.response';
import { GetDelegationInformationResponse } from './dtos/responses/general/get-delegation-information.response';
import { GetDelegatorRewardsResponse } from './dtos/responses/general/get-delegator-rewards.response';
import { GetProposalDetailsResponse } from './dtos/responses/general/get-proposal-details.response';
import { GetProposalsResponse } from './dtos/responses/general/get-proposals.response';
import { GetValidatorVotesByProposalIdResponse } from './dtos/responses/gov/get-validator-votes-by-proposal-id.response';
import { GetVotesByProposalIdResponse } from './dtos/responses/gov/get-votes-by-proposal-id.response';
import {
  AuraTx,
  Chain,
  Gas,
  MultisigConfirm,
  MultisigTransaction,
  Safe,
  SafeOwner,
} from './entities';
import { User } from './entities/user.entity';

export const ENTITIES_CONFIG = {
  SAFE: Safe,
  SAFE_OWNER: SafeOwner,
  MULTISIG_TRANSACTION: MultisigTransaction,
  MULTISIG_CONFIRM: MultisigConfirm,
  CHAIN: Chain,
  MULTISIG_CONFIRM: MultisigConfirm,
  MULTISIG_TRANSACTION: MultisigTransaction,
  AURA_TX: AuraTx,
  GAS: Gas,
  USER: User,
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
  SIGN_IN_REQUEST: AuthRequest,
  GET_VALIDATORS_PARAM: GetValidatorsParam,
  GET_DELEGATOR_REWARDS_PARAM: GetDelegatorRewardsParam,
  GET_DELEGATION_INFORMATION_PARAM: GetDelegationInformationParam,
  GET_DELEGATION_INFORMATION_QUERY: GetDelegationInformationQuery,
  GET_UNDELEGATIONS_PARAM: GetUndelegationsParam,
  GET_PROPOSALS_QUERY: GetProposalsQuery,
  GET_PROPOSAL_DETAILS_PARAM: GetProposalDetailsParam,
  GET_TX_DETAIL_QUERY: GetTxDetailQuery,
  GET_PROPOSALS_PARAM: GetProposalsParam,
  GET_PROPOSAL_VALIDATOR_VOTES_BY_ID_PARAM:
    GetProposalValidatorVotesByIdPathParams,
  GET_PROPOSAL_DEPOSITS_BY_ID_PARAM: GetProposalDepositsByIdPathParams,
  GET_USER_PATH_PARAMS: GetUserPathParam,
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
  MULTISIG_SIGNATURE_RESPONE: MultisigSignatureResponse,
  GET_ACCOUNT_ONCHAIN_RESPONSE: GetAccountOnchainResponse,
  GET_VALIDATORS_RESPONSE: GetValidatorsResponse,
  GET_DELEGATIONS_RESPONSE: GetDelegationsResponse,
  GET_UNDELEGATIONS_RESPONSE: GetUndelegationsResponse,
  GET_DELEGATOR_REWARDS_RESPONSE: GetDelegatorRewardsResponse,
  GET_DELEGATION_INFORMATION_RESPONSE: GetDelegationInformationResponse,
  GET_PROPOSALS_RESPONSE: GetProposalsResponse,
  GET_PROPOSAL_DETAILS_RESPONSE: GetProposalDetailsResponse,
  GET_VOTES_BY_PROPOSAL_ID_RESPONSE: GetVotesByProposalIdResponse,
  GET_VALIDATOR_VOTES_BY_PROPOSAL_ID_RESPONSE:
    GetValidatorVotesByProposalIdResponse,
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
  export abstract class GetUndelegationsParam extends REQUEST_CONFIG.GET_UNDELEGATIONS_PARAM {}
  export abstract class GetTxDetailQuery extends REQUEST_CONFIG.GET_TX_DETAIL_QUERY {}
  export abstract class AuthRequest extends REQUEST_CONFIG.SIGN_IN_REQUEST {}
  export abstract class GetProposalsParam extends REQUEST_CONFIG.GET_PROPOSALS_PARAM {}
  export abstract class GetProposalDetailsParam extends REQUEST_CONFIG.GET_PROPOSAL_DETAILS_PARAM {}
  export abstract class GetProposalValidatorVotesByIdPathParams extends REQUEST_CONFIG.GET_PROPOSAL_VALIDATOR_VOTES_BY_ID_PARAM {}
  export abstract class GetProposalDepositsByIdPathParams extends REQUEST_CONFIG.GET_PROPOSAL_DEPOSITS_BY_ID_PARAM {}
  export abstract class GetUserPathParams extends REQUEST_CONFIG.GET_USER_PATH_PARAMS {}
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
  export abstract class GetValidatorsResponse extends RESPONSE_CONFIG.GET_VALIDATORS_RESPONSE {}
  export abstract class GetDelegationsResponse extends RESPONSE_CONFIG.GET_DELEGATIONS_RESPONSE {}
  export abstract class GetUndelegationsResponse extends RESPONSE_CONFIG.GET_UNDELEGATIONS_RESPONSE {}
  export abstract class GetDelegatorRewardsResponse extends RESPONSE_CONFIG.GET_DELEGATOR_REWARDS_RESPONSE {}
  export abstract class GetDelegationInformationResponse extends RESPONSE_CONFIG.GET_DELEGATION_INFORMATION_RESPONSE {}
  export abstract class GetProposalsResponse extends RESPONSE_CONFIG.GET_PROPOSALS_RESPONSE {}
  export abstract class GetProposalDetailsResponse extends RESPONSE_CONFIG.GET_PROPOSAL_DETAILS_RESPONSE {}
  export abstract class GetVotesByProposalIdResponse extends RESPONSE_CONFIG.GET_VOTES_BY_PROPOSAL_ID_RESPONSE {}
  export abstract class GetValidatorVotesByProposalIdResponse extends RESPONSE_CONFIG.GET_VALIDATOR_VOTES_BY_PROPOSAL_ID_RESPONSE {}
}

export const SERVICE_INTERFACE = {
  ISIMULATING_SERVICE: 'ISimulatingService',
  IMULTISIG_WALLET_SERVICE: 'IMultisigWalletService',
  ITRANSACTION_SERVICE: 'ITransactionService',
  IGENERAL_SERVICE: 'IGeneralService',
  IMULTISIG_TRANSACTION_SERVICE: 'IMultisigTransactionService',
  IAUTH_SERVICE: 'IAuthService',
  IGOV_SERVICE: 'IGovService',
  IUSER_SERVICE: 'IUserService',
};

export const REPOSITORY_INTERFACE = {
  IMULTISIG_WALLET_REPOSITORY: 'IMultisigWalletRepository',
  IMULTISIG_WALLET_OWNER_REPOSITORY: 'IMultisigWalletOwnerRepository',
  ITRANSACTION_REPOSITORY: 'ITransactionRepository',
  IGENERAL_REPOSITORY: 'IGeneralRepository',
  IMULTISIG_TRANSACTION_REPOSITORY: 'IMultisigTransactionsRepository',
  IMULTISIG_CONFIRM_REPOSITORY: 'IMultisigConfirmRepository',
  IGAS_REPOSITORY: 'IGasRepository',
  IUSER_REPOSITORY: 'IUserRepository',
};

export const PROVIDER_INTERFACE = {};
