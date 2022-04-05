export const CONTROLLER_CONSTANTS = {
  SIMULATING: 'simulating',
  MULTISIG_WALLET: 'multisigwallet',
  TRANSACTION: 'transaction',
  OWNER: 'owner',
  NOTIFICATION: 'notification',
  GENERAL: 'general',
  SMART_CONTRACT: 'smartcontract',
};
export const URL_CONSTANTS = {
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
  TRANSACTION_DETAILS: 'transaction-details/:internalTxHash/:safeAddress',
  GET_SAFE: ':safeId',
  GET_SAFE_BALANCE: ':safeId/balance',
  CONFIRM_SAFE: ':safeId',
  DELETE_SAFE: ':safeId',
  GET_SAFES_BY_OWNER: ':address/safes',
  CHECK_ACCOUNT_ON_NETWORK: 'check-account-on-network',
  QUERY_MESSAGE: 'query-message',
  EXECUTE_MESSAGE: 'execute-message',
};

