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
  GetValidatorVotesByProposalIdParams,
  GetProposalDepositsByIdPathParams,
  GetVotesByProposalIdParams,
  GetVotesByProposalIdQuery,
  GetUserPathParam,
  GetProposalParam,
  GetDelegatorRewardsParam,
  GetUndelegationsParam,
  GetValidatorsParam,
  GetValidatorsQuery,
  GetProposalsQuery,
  AuthRequest,
  GetDelegationQuery,
  GetDelegationsParam,
} from './dtos/requests';
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
  GetProposalsResponse,
  GetProposalsProposal,
  GetVotesByProposalIdResponse,
  GetValidatorVotesByProposalIdResponse,
  GetValidatorsResponse,
  GetDelegationsResponse,
  GetUndelegationsResponse,
  GetDelegationResponse,
} from './dtos/responses';
import { GetValidatorDetail } from './dtos/responses/distribution/get-validator.request';
import {
  AuraTx,
  Chain,
  Gas,
  Message,
  MultisigConfirm,
  MultisigTransaction,
  Safe,
  SafeOwner,
  User,
} from './entities';
import { TxMessage } from './entities/tx-message.entity';

export const ENTITIES_CONFIG = {
  SAFE: Safe,
  SAFE_OWNER: SafeOwner,
  CHAIN: Chain,
  MULTISIG_CONFIRM: MultisigConfirm,
  MULTISIG_TRANSACTION: MultisigTransaction,
  AURA_TX: AuraTx,
  GAS: Gas,
  USER: User,
  MESSAGE: Message,
  TX_MESSAGE: TxMessage,
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
  GET_VALIDATORS_QUERY: GetValidatorsQuery,
  GET_DELEGATION_QUERY: GetDelegationQuery,
  GET_DELEGATIONS_PARAM: GetDelegationsParam,
  GET_DELEGATOR_REWARDS_PARAM: GetDelegatorRewardsParam,
  GET_UNDELEGATIONS_PARAM: GetUndelegationsParam,
  GET_PROPOSALS_QUERY: GetProposalsQuery,
  GET_PROPOSAL_PARAM: GetProposalParam,
  GET_TX_DETAIL_QUERY: GetTxDetailQuery,
  GET_PROPOSALS_PARAM: GetProposalsParam,
  GET_VALIDATOR_VOTES_BY_PROPOSAL_ID_PARAM: GetValidatorVotesByProposalIdParams,
  GET_PROPOSAL_DEPOSITS_BY_ID_PARAM: GetProposalDepositsByIdPathParams,
  GET_VOTES_BY_PROPOSAL_ID_PARAM: GetVotesByProposalIdParams,
  GET_VOTES_BY_PROPOSAL_ID_QUERY: GetVotesByProposalIdQuery,
  GET_USER_PATH_PARAMS: GetUserPathParam,
  GET_VALIDATOR_PATH_PARAMS: GetValidatorDetail,
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
  GET_VALIDATORS_RESPONSE: GetValidatorsResponse,
  GET_DELEGATIONS_RESPONSE: GetDelegationsResponse,
  GET_DELEGATION_RESPONSE: GetDelegationResponse,
  GET_UNDELEGATIONS_RESPONSE: GetUndelegationsResponse,
  GET_PROPOSALS_RESPONSE: GetProposalsResponse,
  GET_PROPOSAL_RESPONSE: GetProposalsProposal,
  GET_VOTES_BY_PROPOSAL_ID_RESPONSE: GetVotesByProposalIdResponse,
  GET_VALIDATOR_VOTES_BY_PROPOSAL_ID_RESPONSE:
    GetValidatorVotesByProposalIdResponse,
  GET_VALIDATOR_DETAIL_RESPONSE: GetValidatorDetail,
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
  export abstract class GetValidatorsQuery extends REQUEST_CONFIG.GET_VALIDATORS_QUERY {}
  export abstract class GetDelegationQuery extends REQUEST_CONFIG.GET_DELEGATION_QUERY {}
  export abstract class GetDelegationsParam extends REQUEST_CONFIG.GET_DELEGATIONS_PARAM {}
  export abstract class GetDelegatorRewardsParam extends REQUEST_CONFIG.GET_DELEGATOR_REWARDS_PARAM {}
  export abstract class GetUndelegationsParam extends REQUEST_CONFIG.GET_UNDELEGATIONS_PARAM {}
  export abstract class GetTxDetailQuery extends REQUEST_CONFIG.GET_TX_DETAIL_QUERY {}
  export abstract class AuthRequest extends REQUEST_CONFIG.SIGN_IN_REQUEST {}
  export abstract class GetProposalsParam extends REQUEST_CONFIG.GET_PROPOSALS_PARAM {}
  export abstract class GetProposalParam extends REQUEST_CONFIG.GET_PROPOSAL_PARAM {}
  export abstract class GetValidatorVotesByProposalIdParams extends REQUEST_CONFIG.GET_VALIDATOR_VOTES_BY_PROPOSAL_ID_PARAM {}
  export abstract class GetProposalDepositsByIdPathParams extends REQUEST_CONFIG.GET_PROPOSAL_DEPOSITS_BY_ID_PARAM {}
  export abstract class GetVotesByProposalIdParams extends REQUEST_CONFIG.GET_VOTES_BY_PROPOSAL_ID_PARAM {}
  export abstract class GetVotesByProposalIdQuery extends REQUEST_CONFIG.GET_VOTES_BY_PROPOSAL_ID_QUERY {}
  export abstract class GetUserPathParams extends REQUEST_CONFIG.GET_USER_PATH_PARAMS {}
  export abstract class GetValidatorPathParams extends REQUEST_CONFIG.GET_VALIDATOR_PATH_PARAMS {}
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
  export abstract class GetDelegationResponse extends RESPONSE_CONFIG.GET_DELEGATION_RESPONSE {}
  export abstract class GetUndelegationsResponse extends RESPONSE_CONFIG.GET_UNDELEGATIONS_RESPONSE {}
  export abstract class GetProposalsResponse extends RESPONSE_CONFIG.GET_PROPOSALS_RESPONSE {}
  export abstract class GetProposalResponse extends RESPONSE_CONFIG.GET_PROPOSAL_RESPONSE {}
  export abstract class GetVotesByProposalIdResponse extends RESPONSE_CONFIG.GET_VOTES_BY_PROPOSAL_ID_RESPONSE {}
  export abstract class GetValidatorVotesByProposalIdResponse extends RESPONSE_CONFIG.GET_VALIDATOR_VOTES_BY_PROPOSAL_ID_RESPONSE {}
  export abstract class GetValidatorDetailResponse extends RESPONSE_CONFIG.GET_VALIDATOR_DETAIL_RESPONSE {}
}

export const SERVICE_INTERFACE = {
  ISIMULATING_SERVICE: 'ISimulatingService',
  IMULTISIG_WALLET_SERVICE: 'IMultisigWalletService',
  ITRANSACTION_SERVICE: 'ITransactionService',
  IGENERAL_SERVICE: 'IGeneralService',
  IMULTISIG_TRANSACTION_SERVICE: 'IMultisigTransactionService',
  IAUTH_SERVICE: 'IAuthService',
  IGOV_SERVICE: 'IGovService',
  IDISTRIBUTION_SERVICE: 'IDistributionService',
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
  IMESSAGE_REPOSITORY: 'IMessageRepository',
  ITX_MESSAGE_REPOSITORY: 'ITxMessageRepository',
};

export const PROVIDER_INTERFACE = {};
