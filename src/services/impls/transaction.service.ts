import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { ConfigService } from 'src/shared/services/config.service';
import { ITransactionService } from '../transaction.service';
import {
  makeMultisignedTx,
  MsgSendEncodeObject,
  StargateClient,
} from '@cosmjs/stargate';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { coins } from '@cosmjs/proto-signing';
import { BaseService } from './base.service';
import { DENOM, TRANSACTION_STATUS } from 'src/common/constants/api.constant';
import { ITransactionRepository } from 'src/repositories/itransaction.repository';
import { IMultisigConfirmRepository } from 'src/repositories/imultisig-confirm.repository';
import { IMultisigTransactionsRepository } from 'src/repositories/imultisig-transaction.repository';
import { MultisigConfirm, MultisigTransaction } from 'src/entities';
import { assert } from '@cosmjs/utils';
import { IGeneralRepository } from 'src/repositories/igeneral.repository';
import { ISafeRepository } from 'src/repositories/isafe.repository';
import { IMultisigWalletRepository } from 'src/repositories/imultisig-wallet.repository';
@Injectable()
export class TransactionService
  extends BaseService
  implements ITransactionService
{
  private readonly _logger = new Logger(TransactionService.name);
  private _prefix: string;

  constructor(
    private configService: ConfigService,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_TRANSACTION_REPOSITORY) private multisigTransactionRepos: IMultisigTransactionsRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY) private multisigConfirmRepos: IMultisigConfirmRepository,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY) private chainRepos: IGeneralRepository,
    @Inject(REPOSITORY_INTERFACE.ITRANSACTION_REPOSITORY) private transRepos: ITransactionRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY) private safeRepos: IMultisigWalletRepository,
  ) {
    super(multisigTransactionRepos);
    this._logger.log(
      '============== Constructor Transaction Service ==============',
    );
    this._prefix = this.configService.get('PREFIX');
  }

  async createTransaction(
    request: MODULE_REQUEST.CreateTransactionRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      let chain = await this.chainRepos.findOne({
        where: { id: request.internalChainId },
      });

      const client = await StargateClient.connect(chain.rpc);

      let balance = await client.getBalance(request.from, chain.denom);

      let safe = await this.safeRepos.findOne({
        where: { safeAddress: request.from },
      });

      if (Number(balance.amount) < request.amount) {
        return res.return(ErrorMap.BALANCE_NOT_ENOUGH);
      }

      const signingInstruction = await (async () => {
        const client = await StargateClient.connect(chain.rpc);

        //Check account
        const accountOnChain = await client.getAccount(request.from);
        assert(accountOnChain, 'Account does not exist on chain');

        const msgSend: MsgSend = {
          fromAddress: request.from,
          toAddress: request.to,
          amount: coins(request.amount, chain.denom),
        };
        const msg: MsgSendEncodeObject = {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: msgSend,
        };
        const fee = {
          amount: coins(request.fee, chain.denom),
          gas: request.gasLimit,
        };
        return {
          accountNumber: accountOnChain.accountNumber,
          sequence: accountOnChain.sequence,
          chainId: chain.chainId,
          msgs: [msg],
          fee: fee,
          memo: '',
        };
      })();

      let transaction = new MultisigTransaction();

      transaction.fromAddress = request.from;
      transaction.toAddress = request.to;
      transaction.amount = request.amount;
      transaction.gas = request.gasLimit;
      transaction.fee = request.fee;
      transaction.accountNumber = signingInstruction.accountNumber;
      transaction.typeUrl = signingInstruction.msgs['typeUrl'];
      transaction.denom = chain.denom;
      transaction.status = TRANSACTION_STATUS.PENDING;
      transaction.internalChainId = request.internalChainId;
      transaction.safeId = safe.id;

      await this.multisigTransactionRepos.create(transaction);

      return res.return(ErrorMap.SUCCESSFUL);
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500);
    }
  }

  async sendTransaction(
    request: MODULE_REQUEST.SendTransactionRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      let chain = await this.chainRepos.findOne({
        where: { id: request.internalChainId },
      });

      const client = await StargateClient.connect(chain.rpc);

      //get information multisig transaction Id
      let multisigTransaction = await this.multisigTransactionRepos.findOne({
        where: { id: request.transactionId },
      });

      if (
        !multisigTransaction ||
        multisigTransaction.status != TRANSACTION_STATUS.SEND_WAITING
      ) {
        return res.return(ErrorMap.TRANSACTION_NOT_VALID);
      }

      //Validate owner
      let listOwner = await this.safeRepos.getMultisigWalletsByOwner(multisigTransaction.fromAddress, request.internalChainId);

      let checkOwner = listOwner.find(elelement => {
        if (elelement.safeAddress === multisigTransaction.fromAddress){
          return true;
        }
      });

      if(!checkOwner){
        return res.return(ErrorMap.PERMISSION_DENIED);
      }

      //Get safe info
      let safeInfo = await this.safeRepos.findOne({
        where: {id: multisigTransaction.safeId}
      })

      let multisigConfirmArr = await this.multisigConfirmRepos.findByCondition({ 
         multisigTransactionId: request.transactionId
      });

      let addressSignarureMap = new Map<string, Uint8Array>();

      multisigConfirmArr.forEach((x) => {
        let encodeSignature = Buffer.from(x.signature, 'utf-8');

        addressSignarureMap.set(x.ownerAddress, encodeSignature);
      });

      //Fee
      const fee = {
        amount: coins(multisigTransaction.fee, multisigTransaction.denom),
        gas: multisigTransaction.gas.toString(),
      };

      let encodedBodyBytes = Buffer.from(multisigConfirmArr[0].bodyBytes, 'utf8');

      //Pubkey 
      const safePubkey = JSON.parse(safeInfo.safePubkey);

      let executeTransaction = makeMultisignedTx(
        safePubkey,
        multisigTransaction.sequence,
        fee,
        encodedBodyBytes,
        addressSignarureMap,
      );

      let encodeTransaction = Uint8Array.from(TxRaw.encode(executeTransaction).finish());

      const result = await client.broadcastTx(
        encodeTransaction
      );

      //Update status and txhash
      multisigTransaction.status = TRANSACTION_STATUS.SUCCESS;
      multisigTransaction.txHash = '';
      await this.multisigTransactionRepos.update(multisigTransaction);

      this._logger.log('result', JSON.stringify(result));
      return res.return(ErrorMap.SUCCESSFUL, result);

    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500);
    }
  }

  async singleSignTransaction(
    request: MODULE_REQUEST.SingleSignTransactionRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      //Check status of multisig transaction
      let transaction = await this.multisigTransactionRepos.findOne({
        where: { id: request.transactionId, internalChainId: request.internalChainId },
      });

      if (!transaction) {
        return res.return(ErrorMap.TRANSACTION_NOT_EXIST);
      }

      //Validate owner
      let listOwner = await this.safeRepos.getMultisigWalletsByOwner(request.fromAddress, request.internalChainId);

      let checkOwner = listOwner.find(elelement => {
        if (elelement.safeAddress === request.fromAddress){
          return true;
        }
      });

      if(!checkOwner){
        return res.return(ErrorMap.PERMISSION_DENIED);
      }

      //Check status of multisig confirm
      let listConfirm =
        await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
          request.transactionId,
        );

      let checkExist = listConfirm.find(elelement => {
        if (elelement.ownerAddress === request.fromAddress){
          return true;
        }
      });

      if(checkExist){
        return res.return(ErrorMap.USER_HAS_COMFIRMED);
      }

      let safe = await this.safeRepos.findOne({
        where: { id: transaction.safeId },
      });

      let multisigConfirm = new MultisigConfirm();
      multisigConfirm.multisigTransactionId = request.transactionId;
      multisigConfirm.ownerAddress = request.fromAddress;
      multisigConfirm.signature = request.signature;
      multisigConfirm.bodyBytes = request.bodyBytes;
      multisigConfirm.internalChainId = request.internalChainId;

      await this.multisigConfirmRepos.create(multisigConfirm);

      //Check transaction available
      let listConfirmAfterSign =
        await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
          request.transactionId,
        );

      if (listConfirmAfterSign.length >= safe.threshold) {
        transaction.status = TRANSACTION_STATUS.SEND_WAITING;

        await this.multisigTransactionRepos.update(transaction);
      }
      return res.return(ErrorMap.SUCCESSFUL);
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500);
    }
  }

  async getListConfirmMultisigTransaction(
    param: MODULE_REQUEST.GetMultisigSignaturesParam
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    const resId = await this.multisigTransactionRepos.getMultisigTxId(
      param.internalTxHash,
    );
    if (resId) {
      const result =
        await this.getListConfirmMultisigTransactionById(
          resId.id,
        );
      return res.return(ErrorMap.SUCCESSFUL, result);
    } else {
      return res.return(ErrorMap.TRANSACTION_NOT_EXIST);
    }
  }

  async getListConfirmMultisigTransactionById(
    id: number
  ): Promise<ResponseDto> {
    const result =
      await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
        id,
      );
    return result;
  }

  async getTransactionHistory(
    request: MODULE_REQUEST.GetAllTransactionsRequest
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    const result = await this.transRepos.getAuraTx(request.safeAddress, request.pageIndex, request.pageSize);
    for (let i = 0; i < result.length; i++) {
      if (result[i].FromAddress == request.safeAddress) {
        result[i].Signatures = await this.getListConfirmMultisigTransactionById(result[i].Id);
      }
    }
    return res.return(ErrorMap.SUCCESSFUL, result);
  }
}
