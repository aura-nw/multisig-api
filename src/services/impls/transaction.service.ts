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
import { fromBase64 } from "@cosmjs/encoding";
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { coins } from '@cosmjs/proto-signing';
import { BaseService } from './base.service';
import { ITransactionRepository } from 'src/repositories/itransaction.repository';
import { IMultisigConfirmRepository } from 'src/repositories/imultisig-confirm.repository';
import { IMultisigTransactionsRepository } from 'src/repositories/imultisig-transaction.repository';
import { MultisigConfirm, MultisigTransaction } from 'src/entities';
import { assert } from '@cosmjs/utils';
import { IGeneralRepository } from 'src/repositories/igeneral.repository';
import { IMultisigWalletRepository } from 'src/repositories/imultisig-wallet.repository';
import { MULTISIG_CONFIRM_STATUS, TRANSACTION_STATUS, TransferDirection } from 'src/common/constants/app.constant';
import { ConfirmTransactionRequest } from 'src/dtos/requests/transaction/confirm-transaction.request';

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
      //Validate transaction creator
      let listOwner = await this.safeRepos.getMultisigWalletsByOwner(request.creatorAddress, request.internalChainId);

      let checkOwner = listOwner.find(elelement => {
        if (elelement.safeAddress === request.from){
          return true;
        }
      });

      if(!checkOwner){
        return res.return(ErrorMap.PERMISSION_DENIED);
      }

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
      transaction.status = TRANSACTION_STATUS.AWAITING_CONFIRMATIONS;
      transaction.internalChainId = request.internalChainId;
      transaction.safeId = safe.id;

      let transactionResult = await this.multisigTransactionRepos.create(transaction);

      let requestSign = new ConfirmTransactionRequest();
      requestSign.fromAddress = request.creatorAddress;
      requestSign.transactionId = transactionResult.id;
      requestSign.bodyBytes = request.bodyBytes;
      requestSign.signature = request.signature;
      requestSign.internalChainId = request.internalChainId;

      //Sign to transaction
      await this.confirmTransaction(requestSign);

      return res.return(ErrorMap.SUCCESSFUL, transactionResult.id);
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
        multisigTransaction.status != TRANSACTION_STATUS.AWAITING_EXECUTION
      ) {
        return res.return(ErrorMap.TRANSACTION_NOT_VALID);
      }

      //Validate owner
      // let listOwner = await this.safeRepos.getMultisigWalletsByOwner(multisigTransaction.fromAddress, request.internalChainId);

      // let checkOwner = listOwner.find(elelement => {
      //   if (elelement.safeAddress === request.owner){
      //     return true;
      //   }
      // });

      // if(!checkOwner){
      //   return res.return(ErrorMap.PERMISSION_DENIED);
      // }

      //Get safe info
      let safeInfo = await this.safeRepos.findOne({
        where: {id: multisigTransaction.safeId}
      })

      let multisigConfirmArr = await this.multisigConfirmRepos.findByCondition({ 
         multisigTransactionId: request.transactionId
      });

      let addressSignarureMap = new Map<string, Uint8Array>();

      multisigConfirmArr.forEach((x) => {
        let encodeSignature = fromBase64(x.signature);
        addressSignarureMap.set(x.ownerAddress, encodeSignature);
      });

      //Fee
      const fee = {
        amount: coins(multisigTransaction.fee, multisigTransaction.denom),
        gas: multisigTransaction.gas.toString(),
      };

      let encodedBodyBytes = fromBase64(multisigConfirmArr[0].bodyBytes);

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
      this._logger.log('result', JSON.stringify(result));

      //Update status and txhash
      multisigTransaction.status = TRANSACTION_STATUS.PENDING;
      multisigTransaction.txHash = '';
      await this.multisigTransactionRepos.update(multisigTransaction);

      //Record owner send transaction
      let sender = new MultisigConfirm();
      sender.multisigTransactionId = request.transactionId;
      sender.internalChainId = request.internalChainId;
      sender.ownerAddress = request.owner;
      sender.status = MULTISIG_CONFIRM_STATUS.SEND;

      await this.multisigConfirmRepos.create(sender);

      return res.return(ErrorMap.SUCCESSFUL, result);

    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500);
    }
  }

  async confirmTransaction(
    request: MODULE_REQUEST.ConfirmTransactionRequest,
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
        if (elelement.safeAddress === transaction.fromAddress){
          return true;
        }
      });

      if(!checkOwner){
        return res.return(ErrorMap.PERMISSION_DENIED);
      }

      //Check status of multisig confirm
      let listConfirm =
        await this.multisigConfirmRepos.findByCondition({
          multisigTransactionId: request.transactionId,
          ownerAddress: request.fromAddress
      });

      if(listConfirm.length > 0){
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
      multisigConfirm.status = MULTISIG_CONFIRM_STATUS.CONFIRM;

      await this.multisigConfirmRepos.create(multisigConfirm);

      //Check transaction available
      let listConfirmAfterSign = await this.multisigConfirmRepos.findByCondition({
        multisigTransactionId: request.transactionId,
        status: MULTISIG_CONFIRM_STATUS.CONFIRM,
        internalChainId: request.internalChainId
      });

      if (listConfirmAfterSign.length >= safe.threshold) {
        transaction.status = TRANSACTION_STATUS.AWAITING_EXECUTION;

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

  async rejectTransaction(request: MODULE_REQUEST.RejectTransactionParam): Promise<ResponseDto> {
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
        if (elelement.safeAddress === transaction.fromAddress){
          return true;
        }
      });

      if(!checkOwner){
        return res.return(ErrorMap.PERMISSION_DENIED);
      }

      //Check status of multisig confirm
      let listConfirm =
        await this.multisigConfirmRepos.findByCondition({
          multisigTransactionId: request.transactionId,
          ownerAddress: request.fromAddress
      });

      if(listConfirm.length > 0){
        return res.return(ErrorMap.USER_HAS_COMFIRMED);
      }

      let multisigConfirm = new MultisigConfirm();
      multisigConfirm.multisigTransactionId = request.transactionId;
      multisigConfirm.ownerAddress = request.fromAddress;
      multisigConfirm.internalChainId = request.internalChainId;
      multisigConfirm.status = MULTISIG_CONFIRM_STATUS.REJECT;

      await this.multisigConfirmRepos.create(multisigConfirm);

      return res.return(ErrorMap.SUCCESSFUL);
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500);
    }
  }

  async getListConfirmMultisigTransaction(
    param: MODULE_REQUEST.GetTransactionDetailsParam
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
      if(result[i].Status == '0') result[i].Status = TRANSACTION_STATUS.SUCCESS;
      if (result[i].FromAddress == request.safeAddress) {
        result[i].Direction = TransferDirection.OUTGOING;
        result[i].Signatures = await this.getListConfirmMultisigTransactionById(result[i].Id);
      } else if (result[i].ToAddress == request.safeAddress) {
        result[i].Direction = TransferDirection.INCOMING;
      }
    }
    return res.return(ErrorMap.SUCCESSFUL, result);
  }

  async getTransactionDetails(
    param: MODULE_REQUEST.GetTransactionDetailsParam
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const { internalTxHash } = param;
      let condition = this.calculateCondition(internalTxHash);
      let result;
      if(condition.txHash) {
        result = await this.transRepos.getTransactionDetailsAuraTx(condition);
      }
      if(!result || condition.id) {
        result = await this.multisigTransactionRepos.getTransactionDetailsMultisigTransaction(condition);
      }
      if(!result || result.length == 0) {
        this._logger.debug(
          `Not found any transaction with condition: ${JSON.stringify(condition)}`,
        );
        return res.return(ErrorMap.TRANSACTION_NOT_EXIST);
      }
      else {
        if(result.TxHash) {
          const param :MODULE_REQUEST.GetTransactionDetailsParam = { internalTxHash: result.TxHash}
          result.Signatures = await (await this.getListConfirmMultisigTransaction(param)).Data;
        } else {
          result.Signatures = await this.getListConfirmMultisigTransactionById(result.Id);
        }
      }
      return res.return(ErrorMap.SUCCESSFUL, result);
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500, error.message);
    }
  }

  private calculateCondition(internalTxHash: string) {
    return isNaN(Number(internalTxHash))
      ? {
        txHash: internalTxHash
      }
      : {
        id: internalTxHash,
      };
  }
}
