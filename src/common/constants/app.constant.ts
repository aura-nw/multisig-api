import { GeneratedType } from '@cosmjs/proto-signing';
import { MsgSend, MsgMultiSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';
import { MsgVote } from 'cosmjs-types/cosmos/gov/v1beta1/tx';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { wasmTypes } from '@cosmjs/cosmwasm-stargate/build/modules';
import { defaultRegistryTypes } from '@cosmjs/stargate';

export const COMMON_CONSTANTS = {
  REGEX_BASE64:
    /^([\d+/A-Za-z]{4})*([\d+/A-Za-z]{4}|[\d+/A-Za-z]{3}=|[\d+/A-Za-z]{2}==)$/,
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

export enum DatabaseType {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
}
export enum SafeStatus {
  PENDING = 'pending',
  CREATED = 'created',
  DELETED = 'deleted',
}

export enum SafeOwnerStatus {
  NEED_CONFIRM = 'needConfirm',
  CONFIRMED = 'confirmed',
}

export enum TransactionStatus {
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
export enum MultisigConfirmStatus {
  CONFIRM = 'CONFIRM',
  REJECT = 'REJECT',
  DELETE = 'DELETE',
  SEND = 'SEND',
}

export enum TransferDirection {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
  UNKNOWN = 'UNKNOWN',
}

export enum PubkeyTypes {
  SECP256K1 = 'tendermint/PubKeySecp256k1',
}
export enum TxTypeUrl {
  SEND = '/cosmos.bank.v1beta1.MsgSend',
  MULTI_SEND = '/cosmos.bank.v1beta1.MsgMultiSend',
  DELEGATE = '/cosmos.staking.v1beta1.MsgDelegate',
  REDELEGATE = '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  UNDELEGATE = '/cosmos.staking.v1beta1.MsgUndelegate',
  WITHDRAW_REWARD = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  VOTE = '/cosmos.gov.v1beta1.MsgVote',
  DEPOSIT = '/cosmos.gov.v1beta1.MsgDeposit',
  VOTE_WEIGHTED = '/cosmos.gov.v1beta1.MsgVoteWeighted',
  EXECUTE_CONTRACT = '/cosmwasm.wasm.v1.MsgExecuteContract',
  INSTANTIATE_CONTRACT = '/cosmwasm.wasm.v1.MsgInstantiateContract',
  MIGRATE_CONTRACT = '/cosmwasm.wasm.v1.MsgMigrateContract',
  CREATE_VESTING_ACCOUNT = '/cosmos.vesting.v1beta1.MsgCreateVestingAccount',
  IBC_TRANSFER = '/ibc.applications.transfer.v1.MsgTransfer',
  STORE_CODE = '/cosmwasm.wasm.v1.MsgStoreCode',
  RECEIVE = 'Receive',
  CUSTOM = 'Custom',
}

export enum DisplayTypes {
  SEND = 'Send',
}

export const RegistryGeneratedTypes: Iterable<[string, GeneratedType]> = [
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
  ['/cosmos.gov.v1beta1.MsgVote', MsgVote],
  ['/cosmwasm.wasm.v1.MsgExecuteContract', MsgExecuteContract],

  ...defaultRegistryTypes,
  ...wasmTypes,
];

export enum ProposalStatus {
  VOTING_PERIOD = 'ProposalStatus_VOTING_PERIOD',
  PASSED = 'ProposalStatus_PASSED',
  REJECTED = 'ProposalStatus_REJECTED',
}

export enum VoteAnswer {
  VOTE_OPTION_YES = 'VOTE_OPTION_YES',
  VOTE_OPTION_NO = 'VOTE_OPTION_NO',
  VOTE_OPTION_NO_WITH_VETO = 'VOTE_OPTION_NO_WITH_VETO',
  VOTE_OPTION_ABSTAIN = 'VOTE_OPTION_ABSTAIN',
}

export enum ValidatorStatus {
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
