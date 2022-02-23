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
  SIGLE_SIGN: 'sign',
  NETWORK_LIST: 'network-list',
  GET_ALL_TXS: 'get-all-txs',
  SIGNATURES: 'multisig/:internalTxHash/signatures',
  GET_SAFE: ':safeId',
  GET_SAFE_BALANCE: ':safeId/balance',
  CONFIRM_SAFE: ':safeId',
  DELETE_SAFE: ':safeId',
  GET_SAFES_BY_OWNER: ':address/safes',
};
export const DENOM = {
  uaura: 'uaura',
  uatom: 'uatom',
  uluna: 'uluna',
};
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  CANCEL: 'CANCEL',
  SEND_WAITING: 'SEND_WAITING',
};
