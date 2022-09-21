import { GeneratedType } from '@cosmjs/proto-signing';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';
import { MsgVote } from 'cosmjs-types/cosmos/gov/v1beta1/tx';
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from 'cosmjs-types/cosmos/staking/v1beta1/tx';

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

export enum PUBKEY_TYPES {
  SECP256K1 = 'tendermint/PubKeySecp256k1',
}
export enum NETWORK_URL_TYPE {
  COSMOS = '/cosmos.bank.v1beta1.MsgSend',
  EXECUTE_CONTRACT = '/cosmwasm.wasm.v1.MsgExecuteContract',
}

export const REGISTRY_GENERATED_TYPES: Iterable<[string, GeneratedType]> = [
  ['/cosmos.bank.v1beta1.MsgSend', MsgSend],
  ['/cosmos.staking.v1beta1.MsgDelegate', MsgDelegate],
  ['/cosmos.staking.v1beta1.MsgBeginRedelegate', MsgBeginRedelegate],
  ['/cosmos.staking.v1beta1.MsgUndelegate', MsgUndelegate],
  [
    '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
    MsgWithdrawDelegatorReward,
  ],
  ['/cosmos.gov.v1beta1.MsgVote', MsgVote],
];

export enum PROPOSAL_STATUS {
  VOTING_PERIOD = 'PROPOSAL_STATUS_VOTING_PERIOD',
  PASSED = 'PROPOSAL_STATUS_PASSED',
  REJECTED = 'PROPOSAL_STATUS_REJECTED',
}

export enum VOTE_ANSWER {
  VOTE_OPTION_YES = 'VOTE_OPTION_YES',
  VOTE_OPTION_NO = 'VOTE_OPTION_NO',
  VOTE_OPTION_NO_WITH_VETO = 'VOTE_OPTION_NO_WITH_VETO',
  VOTE_OPTION_ABSTAIN = 'VOTE_OPTION_ABSTAIN',
}
