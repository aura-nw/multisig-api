import { ConnectMultisigWalletRequest } from './dtos/requests/multisig-wallet/connect-multisig-wallet.request';
import { CreateMultisigWalletRequest } from './dtos/requests/multisig-wallet/create-multisig-wallet.request';
import { ConfirmMultisigWalletRequest } from './dtos/requests/multisig-wallet/confirm-multisig-wallet.request';
import { DeleteMultisigWalletRequest } from './dtos/requests/multisig-wallet/delete-multisig-wallet.request';
import { SimulatingMultisigRequest } from './dtos/requests/simulating/simulating-multisig.request';
import { SimulatingSignMsgRequest } from './dtos/requests/simulating/simulating-sign-msg.request';
import { BroadcastTransactionRequest } from './dtos/requests/transaction/broadcast-transaction.request';
import { CreateTransactionRequest } from './dtos/requests/transaction/create-transaction.request';
import { SingleSignTransactionRequest } from './dtos/requests/transaction/single-sign-transaction.request';
import { Safe } from './entities/safe.entity';
import { SafeOwner } from './entities/safe-owner.entity';

export const ENTITIES_CONFIG = {
  SAFE: Safe,
  SAFE_OWNER: SafeOwner,
};

export const REQUEST_CONFIG = {
  SIMULATING_MULTISIG_REQUEST: SimulatingMultisigRequest,
  SIMULATING_SIGN_MSG_REQUEST: SimulatingSignMsgRequest,
  CREATE_MULTISIG_WALLET_REQUEST: CreateMultisigWalletRequest,
  CONFIRM_MULTISIG_WALLET_REQUEST: ConfirmMultisigWalletRequest,
  DELETE_MULTISIG_WALLET_REQUEST: DeleteMultisigWalletRequest,
  CREATE_TRANSACTION_REQUEST: CreateTransactionRequest,
  SINGLE_SIGN_TRANSACTION_REQUEST: SingleSignTransactionRequest,
  BROADCAST_TRANSACTION_REQUEST: BroadcastTransactionRequest,
  CONNECT_WALLET_TO_GET_INFORMATION: ConnectMultisigWalletRequest
};

export module MODULE_REQUEST {
  export abstract class SimulatingMultisigRequest extends REQUEST_CONFIG.SIMULATING_MULTISIG_REQUEST {}
  export abstract class SimulatingSignMsgRequest extends REQUEST_CONFIG.SIMULATING_SIGN_MSG_REQUEST {}
  export abstract class CreateMultisigWalletRequest extends REQUEST_CONFIG.CREATE_MULTISIG_WALLET_REQUEST {}
  export abstract class ConfirmMultisigWalletRequest extends REQUEST_CONFIG.CONFIRM_MULTISIG_WALLET_REQUEST {}
  export abstract class DeleteMultisigWalletRequest extends REQUEST_CONFIG.DELETE_MULTISIG_WALLET_REQUEST {}
  export abstract class CreateTransactionRequest extends REQUEST_CONFIG.CREATE_TRANSACTION_REQUEST {}
  export abstract class SingleSignTransactionRequest extends REQUEST_CONFIG.SINGLE_SIGN_TRANSACTION_REQUEST {}
  export abstract class BroadcastTransactionRequest extends REQUEST_CONFIG.BROADCAST_TRANSACTION_REQUEST {}
  export abstract class ConnectMultisigWalletRequest extends REQUEST_CONFIG.CONNECT_WALLET_TO_GET_INFORMATION {}
}

export const SERVICE_INTERFACE = {
    ISIMULATING_SERVICE: "ISimulatingService",
    IMULTISIG_WALLET_SERVICE: "IMultisigWalletService",
    ITRANSACTION_SERVICE: "ITransactionService",
    IGENERAL_SERVICE: "IGeneralService",
};

export const REPOSITORY_INTERFACE = {
  IMULTISIG_WALLET_REPOSITORY: 'IMultisigWalletRepository',
  IMULTISIG_WALLET_OWNER_REPOSITORY: 'IMultisigWalletOwnerRepository',
};

export const PROVIDER_INTERFACE = {};
