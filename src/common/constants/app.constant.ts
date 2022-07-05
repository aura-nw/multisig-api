export const COMMON_CONSTANTS = {
  REGEX_BASE64: new RegExp(
    /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/,
  ),
};

export enum AppConstants {
  USER_KEY = 'user_key',
}

export enum ORDER_BY {
  DESC = 'DESC',
  ASC = 'ASC',
}
export enum DATABASE_TYPE {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
}
export enum SAFE_STATUS {
  PENDING = 'pending',
  CREATED = 'created',
  DELETED = 'deleted',
}

export enum SAFE_OWNER_STATUS {
  NEED_CONFIRM = 'needConfirm',
  CONFIRMED = 'confirmed',
}

export enum TRANSACTION_STATUS {
  AWAITING_CONFIRMATIONS = 'AWAITING_CONFIRMATIONS',
  AWAITING_EXECUTION = 'AWAITING_EXECUTION',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}
export enum MULTISIG_CONFIRM_STATUS {
  CONFIRM = 'CONFIRM',
  REJECT = 'REJECT',
  SEND = 'SEND',
}

export enum TRANSFER_DIRECTION {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
  UNKNOWN = 'UNKNOWN',
}

export enum NETWORK_URL_TYPE {
  COSMOS = '/cosmos.bank.v1beta1.MsgSend',
  EXECUTE_CONTRACT = '/cosmwasm.wasm.v1.MsgExecuteContract',
}
