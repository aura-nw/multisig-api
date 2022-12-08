export const CONTROLLER_CONSTANTS = {
  SIMULATING: 'simulating',
  MULTISIG_WALLET: 'multisigwallet',
  TRANSACTION: 'transaction',
  OWNER: 'owner',
  NOTIFICATION: 'notification',
  GENERAL: 'general',
  AUTH: 'auth',
  GOV: 'gov',
  DISTRIBUTION: 'distribution',
  USER: 'user',
};
export const URL_CONSTANTS = {
  CHANGE_SEQ: 'change-seq',
  DELETE_TX: 'delete',
  GET_ADDRESS_SIMULATE: 'simulate/address',
  SIMULATE_TX: 'simulate',
  broadcasting: 'broadcasting',
  signing: 'signing',
  CONNECT_WALLET: 'connect_wallet',
  CREATE: 'create',
  SEND: 'send',
  CONFIRM_TRANSACTION: 'confirm',
  REJECT_TRANSACTION: 'reject',
  NETWORK_LIST: 'network-list',
  ACCOUNT_ONCHAIN: 'get-account-onchain/:safeAddress/:internalChainId',
  GET_ALL_TXS: 'get-all-txs',
  SIGNATURES: 'multisig/:id/signatures',
  TRANSACTION_DETAILS: 'transaction-details',
  GET_SAFE: ':safeId',
  GET_SAFE_BALANCE: ':safeId/balance',
  CONFIRM_SAFE: ':safeId',
  DELETE_SAFE: ':safeId',
  GET_SAFES_BY_OWNER: ':address/safes',
  CHECK_ACCOUNT_ON_NETWORK: 'check-account-on-network',
  QUERY_MESSAGE: 'query-message',
  CREATE_EXECUTE_MESSAGE: 'create-execute-message',
  CONFIRM_EXECUTE_MESSAGE: 'confirm-execute-message',
  REJECT_EXECUTE_MESSAGE: 'reject-execute-message',
  SEND_EXECUTE_MESSAGE: 'send-execute-message',
  AUTH: 'auth',
  LIST_VALIDATORS: '/network/:internalChainId/validators',
  GET_VALIDATORS: '/:internalChainId/validators',
  GET_VALIDATOR: '/:internalChainId/validators/:operatorAddress',
  GET_DELEGATIONS: '/:internalChainId/:delegatorAddress/delegations',
  GET_DELEGATION: '/delegation',
  GET_UNDELEGATIONS: '/:internalChainId/:delegatorAddress/undelegations',
  DELEGATOR_REWARDS: '/:internalChainId/:delegatorAddress/rewards',
  DELEGATION_INFORMATION: '/:internalChainId/:delegatorAddress',
  GET_PROPOSALS: ':internalChainId/proposals',
  GET_PROPOSAL_BY_ID: ':internalChainId/proposals/:proposalId',
  GET_PROPOSAL_DEPOSITS_BY_ID:
    ':internalChainId/proposal/:proposalId/depositors',
  GET_VOTES_BY_PROPOSAL_ID: ':internalChainId/proposal/:proposalId/votes',
  GET_VALIDATOR_VOTES_BY_PROPOSAL_ID:
    ':internalChainId/proposal/:proposalId/validator-votes',
  GET_USER_BY_ADDRESS: ':address',
};
