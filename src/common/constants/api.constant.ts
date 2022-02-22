export const CONTROLLER_CONSTANTS = {
  SIMULATING: 'simulating',
  MULTISIG_WALLET: 'multisigwallet',
  TRANSACTION: 'transaction',
  OWNER: 'owner',
  NOTIFICATION: 'notification',
  GENERAL: 'general',
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
  GET_ALL_TXS: 'get-all-txs',
  SIGNATURES: 'multisig/:internalTxHash/signatures',
  TRANSACTION_DETAILS: 'transaction-details/:internalTxHash',
  GET_SAFE: ':safeId',
  CONFIRM_SAFE: ':safeId',
  DELETE_SAFE: ':safeId',
  GET_SAFES_BY_OWNER: ':address/safes',
};

