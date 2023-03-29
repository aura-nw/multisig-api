import { GeneratedType } from '@cosmjs/proto-signing';
import { MsgSend, MsgMultiSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
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

export enum NotificationEventType {
  WAIT_ALLOW_SAFE = 'WAIT_ALLOW_SAFE',
  SAFE_CREATED = 'SAFE_CREATED',
  WAIT_CONFIRM_TX = 'WAIT_CONFIRM_TX',
  WAIT_EXECUTE_TX = 'WAIT_EXECUTE_TX',
  TX_BROADCASTED = 'TX_BROADCASTED',
  TX_DELETED = 'TX_DELETED',
  START_VOTING_PERIOD = 'START_VOTING_PERIOD',
}

export enum NotificationStatus {
  READ = 'READ',
  UNREAD = 'UNREAD',
}

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
  REPLACED = 'REPLACED',
  DELETED = 'DELETED',
  EXECUTING = 'EXECUTING',
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
export enum TX_TYPE_URL {
  SEND = '/cosmos.bank.v1beta1.MsgSend',
  MULTI_SEND = '/cosmos.bank.v1beta1.MsgMultiSend',
  DELEGATE = '/cosmos.staking.v1beta1.MsgDelegate',
  REDELEGATE = '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  UNDELEGATE = '/cosmos.staking.v1beta1.MsgUndelegate',
  WITHDRAW_REWARD = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  VOTE = '/cosmos.gov.v1beta1.MsgVote',
  EXECUTE_CONTRACT = '/cosmwasm.wasm.v1.MsgExecuteContract',
  RECEIVE = 'Receive',
}

export const REGISTRY_GENERATED_TYPES: Iterable<[string, GeneratedType]> = [
  ['/cosmos.bank.v1beta1.MsgSend', MsgSend],
  ['/cosmos.bank.v1beta1.MsgMultiSend', MsgMultiSend],
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

export enum VALIDATOR_STATUS {
  BOND_STATUS_UNSPECIFIED = 'BOND_STATUS_UNSPECIFIED',
  BOND_STATUS_UNBONDED = 'BOND_STATUS_UNBONDED',
  BOND_STATUS_UNBONDING = 'BOND_STATUS_UNBONDING',
  BOND_STATUS_BONDED = 'BOND_STATUS_BONDED',
}

export const VESTING_ACCOUNT_TYPE = [
  '/cosmos.vesting.v1beta1.BaseVestingAccount',
  '/cosmos.vesting.v1beta1.ContinuousVestingAccount',
  '/cosmos.vesting.v1beta1.DelayedVestingAccount',
  '/cosmos.vesting.v1beta1.PeriodicVestingAccount',
];
