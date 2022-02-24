import { ConnectMultisigWalletRequest } from './dtos/requests/multisig-wallet/connect-multisig-wallet.request';
import { CreateMultisigWalletRequest } from './dtos/requests/multisig-wallet/create-multisig-wallet.request';
import {
  ConfirmMultisigWalletRequest,
  ConfirmSafePathParams,
} from './dtos/requests/multisig-wallet/confirm-multisig-wallet.request';
import {
  DeleteMultisigWalletRequest,
  DeleteSafePathParams,
} from './dtos/requests/multisig-wallet/delete-multisig-wallet.request';
import { SimulatingMultisigRequest } from './dtos/requests/simulating/simulating-multisig.request';
import { SimulatingSignMsgRequest } from './dtos/requests/simulating/simulating-sign-msg.request';
import { SendTransactionRequest } from './dtos/requests/transaction/send-transaction.request';
import { SingleSignTransactionRequest } from './dtos/requests/transaction/single-sign-transaction.request';
import { Safe } from './entities/safe.entity';
import { SafeOwner } from './entities/safe-owner.entity';
import { Chain } from './entities/chain.entity';
import { MultisigConfirm } from './entities/multisig-confirm.entity';
import { MultisigTransaction } from './entities/multisig-transaction.entity';
import { CreateTransactionRequest } from './dtos/requests/transaction/create-transaction.request';
import { AuraTx } from './entities';
import {
  GetSafeBalancePathParams,
  GetSafeBalanceQuery,
  GetSafePathParams,
  GetSafeQuery,
} from './dtos/requests/multisig-wallet/get-safe.request';
import {
  GetSafesByOwnerAddressParams,
  GetSafesByOwnerAddressQuery,
} from './dtos/requests/multisig-wallet/get-safe-by-owner.request';
import { GetAllTransactionsRequest } from './dtos/requests/transaction/get-all-transactions.request';
import { GetMultisigSignaturesParam } from './dtos/requests/multisig-wallet/get-multisig-signatures.request';

export const ENTITIES_CONFIG = {
  SAFE: Safe,
  SAFE_OWNER: SafeOwner,
  CHAIN: Chain,
  MULTISIG_CONFIRM: MultisigConfirm,
  MULTISIG_TRANSACTION: MultisigTransaction,
  AURA_TX: AuraTx,
};

export const REQUEST_CONFIG = {
  SIMULATING_MULTISIG_REQUEST: SimulatingMultisigRequest,
  SIMULATING_SIGN_MSG_REQUEST: SimulatingSignMsgRequest,
  CREATE_MULTISIG_WALLET_REQUEST: CreateMultisigWalletRequest,
  CONFIRM_MULTISIG_WALLET_REQUEST: ConfirmMultisigWalletRequest,
  DELETE_MULTISIG_WALLET_REQUEST: DeleteMultisigWalletRequest,
  CREATE_TRANSACTION_REQUEST: CreateTransactionRequest,
  SEND_TRANSACTION_REQUEST: SendTransactionRequest,
  SINGLE_SIGN_TRANSACTION_REQUEST: SingleSignTransactionRequest,
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
  GET_MULTISIG_SIGNATURES_PARAM: GetMultisigSignaturesParam,
};

export module MODULE_REQUEST {
  export abstract class SimulatingMultisigRequest extends REQUEST_CONFIG.SIMULATING_MULTISIG_REQUEST { }
  export abstract class SimulatingSignMsgRequest extends REQUEST_CONFIG.SIMULATING_SIGN_MSG_REQUEST { }
  export abstract class CreateMultisigWalletRequest extends REQUEST_CONFIG.CREATE_MULTISIG_WALLET_REQUEST { }
  export abstract class ConfirmMultisigWalletRequest extends REQUEST_CONFIG.CONFIRM_MULTISIG_WALLET_REQUEST { }
  export abstract class DeleteMultisigWalletRequest extends REQUEST_CONFIG.DELETE_MULTISIG_WALLET_REQUEST { }
  export abstract class CreateTransactionRequest extends REQUEST_CONFIG.CREATE_TRANSACTION_REQUEST { }
  export abstract class SendTransactionRequest extends REQUEST_CONFIG.SEND_TRANSACTION_REQUEST { }
  export abstract class SingleSignTransactionRequest extends REQUEST_CONFIG.SINGLE_SIGN_TRANSACTION_REQUEST { }
  export abstract class ConnectMultisigWalletRequest extends REQUEST_CONFIG.CONNECT_WALLET_TO_GET_INFORMATION { }
  export abstract class GetSafeQuery extends REQUEST_CONFIG.GET_SAFE_QUERY { }
  export abstract class GetSafeBalanceQuery extends REQUEST_CONFIG.GET_SAFE_BALANCE_QUERY { }
  export abstract class GetSafesByOwnerAddressQuery extends REQUEST_CONFIG.GET_SAFES_BY_OWNER_QUERY { }
  export abstract class GetSafePathParams extends REQUEST_CONFIG.GET_SAFE_PATH_PARAMS { }
  export abstract class GetSafeBalancePathParams extends REQUEST_CONFIG.GET_SAFE_BALANCE_PATH_PARAMS { }
  export abstract class ConfirmSafePathParams extends REQUEST_CONFIG.CONFIRM_SAFE_PATH_PARAMS { }
  export abstract class DeleteSafePathParams extends REQUEST_CONFIG.DELETE_SAFE_PATH_PARAMS { }
  export abstract class GetSafesByOwnerAddressParams extends REQUEST_CONFIG.GET_SAFES_BY_OWNER_PARAM { }
  export abstract class GetAllTransactionsRequest extends REQUEST_CONFIG.GET_ALL_TRANSACTION_REQUEST { }
  export abstract class GetMultisigSignaturesParam extends REQUEST_CONFIG.GET_MULTISIG_SIGNATURES_PARAM { }
}

export const SERVICE_INTERFACE = {
  ISIMULATING_SERVICE: 'ISimulatingService',
  IMULTISIG_WALLET_SERVICE: 'IMultisigWalletService',
  ITRANSACTION_SERVICE: 'ITransactionService',
  IGENERAL_SERVICE: 'IGeneralService',
};

export const REPOSITORY_INTERFACE = {
  IMULTISIG_WALLET_REPOSITORY: 'IMultisigWalletRepository',
  IMULTISIG_WALLET_OWNER_REPOSITORY: 'IMultisigWalletOwnerRepository',
  ITRANSACTION_REPOSITORY: 'ITransactionRepository',
  IGENERAL_REPOSITORY: 'IGeneralRepository',
  IMULTISIG_TRANSACTION_REPOSITORY: 'IMultisigTransactionsRepository',
  IMULTISIG_CONFIRM_REPOSITORY: 'IMultisigConfirmRepository',
  ISAFE_REPOSITORY: 'ISafeRepository',
};

export const PROVIDER_INTERFACE = {};
