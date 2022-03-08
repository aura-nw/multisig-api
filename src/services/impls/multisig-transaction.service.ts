import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { IMultisigTransactionService } from '../multisig-transaction.service';
import { calculateFee, GasPrice, makeMultisignedTx, StargateClient,} from '@cosmjs/stargate';
import { fromBase64 } from "@cosmjs/encoding";
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { BaseService } from './base.service';
import { MultisigConfirm, MultisigTransaction } from 'src/entities';
import { MULTISIG_CONFIRM_STATUS, NETWORK_URL_TYPE, TRANSACTION_STATUS } from 'src/common/constants/app.constant';
import { CustomError } from 'src/common/customError';
import { IGeneralRepository, IMultisigConfirmRepository, IMultisigTransactionsRepository, IMultisigWalletRepository } from 'src/repositories';
import { ConfirmTransactionRequest } from 'src/dtos/requests';

@Injectable()
export class MultisigTransactionService extends BaseService implements IMultisigTransactionService{
  private readonly _logger = new Logger(MultisigTransactionService.name);

  constructor(
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_TRANSACTION_REPOSITORY) private multisigTransactionRepos: IMultisigTransactionsRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY) private multisigConfirmRepos: IMultisigConfirmRepository,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY) private chainRepos: IGeneralRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY) private safeRepos: IMultisigWalletRepository,
  ) {
    super(multisigTransactionRepos);
    this._logger.log(
      '============== Constructor Multisig Transaction Service ==============',
    );
  }

  async createTransaction(
    request: MODULE_REQUEST.CreateTransactionRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      //Validate transaction creator
      let checkOwner = await this.multisigConfirmRepos.validateOwner(request.creatorAddress, request.from, request.internalChainId);

      if(checkOwner){
        throw new CustomError(ErrorMap.PERMISSION_DENIED);
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
        throw new CustomError(ErrorMap.BALANCE_NOT_ENOUGH);
      }

      const signingInstruction = await (async () => {
        const client = await StargateClient.connect(chain.rpc);

        //Check account
        const accountOnChain = await client.getAccount(request.from);
        if(!accountOnChain){
          throw new CustomError(ErrorMap.E001);
        }

        return {
          accountNumber: accountOnChain.accountNumber,
          sequence: accountOnChain.sequence,
          chainId: chain.chainId,
        };
      })();

      let transaction = new MultisigTransaction();

      transaction.fromAddress = request.from;
      transaction.toAddress = request.to;
      transaction.amount = request.amount;
      transaction.gas = request.gasLimit;
      transaction.fee = request.fee;
      transaction.accountNumber = signingInstruction.accountNumber;
      transaction.typeUrl = NETWORK_URL_TYPE.COSMOS;
      transaction.denom = chain.denom;
      transaction.status = TRANSACTION_STATUS.AWAITING_CONFIRMATIONS;
      transaction.internalChainId = request.internalChainId;
      transaction.sequence = signingInstruction.sequence.toString();
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

      return res.return(ErrorMap.SUCCESSFUL, transactionResult.id, {'transactionId:': transactionResult.id});
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(error.message === ErrorMap.E500.Message ? ErrorMap.E500 : error.errorMap);
    }
  }

  async sendTransaction(
    request: MODULE_REQUEST.SendTransactionRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      let chain = await this.chainRepos.findOne({where: { id: request.internalChainId }});

      const client = await StargateClient.connect(chain.rpc);

      //get information multisig transaction Id
      let multisigTransaction = await this.multisigTransactionRepos.findOne({ where: { id: request.transactionId }});

      if (!multisigTransaction || multisigTransaction.status != TRANSACTION_STATUS.AWAITING_EXECUTION) {
        throw new CustomError(ErrorMap.TRANSACTION_NOT_VALID);
      }

      //Validate owner
      let listOwner = await this.safeRepos.getMultisigWalletsByOwner(request.owner, request.internalChainId);

      let checkOwner = listOwner.find(elelement => {
        if (elelement.safeAddress === multisigTransaction.fromAddress){
          return true;
        }
      });

      if(!checkOwner){
        throw new CustomError(ErrorMap.PERMISSION_DENIED);
      }

      //Get safe info
      let safeInfo = await this.safeRepos.findOne({
        where: {id: multisigTransaction.safeId}
      })

      //Get all signature of transaction
      let multisigConfirmArr = await this.multisigConfirmRepos.findByCondition({ 
         multisigTransactionId: request.transactionId,
         status: MULTISIG_CONFIRM_STATUS.CONFIRM
      });

      let addressSignarureMap = new Map<string, Uint8Array>();

      multisigConfirmArr.forEach((x) => {
        let encodeSignature = fromBase64(x.signature);
        addressSignarureMap.set(x.ownerAddress, encodeSignature);
      });

      //Fee
      const gasPrice = GasPrice.fromString(String(multisigTransaction.fee).concat(multisigTransaction.denom));
      const sendFee = calculateFee(multisigTransaction.gas, gasPrice);

      let encodedBodyBytes = fromBase64(multisigConfirmArr[0].bodyBytes);

      //Pubkey 
      const safePubkey = JSON.parse(safeInfo.safePubkey);

      let executeTransaction = makeMultisignedTx(
        safePubkey,
        multisigTransaction.sequence,
        sendFee,
        encodedBodyBytes,
        addressSignarureMap,
      );

      let encodeTransaction = Uint8Array.from(TxRaw.encode(executeTransaction).finish());

      try {
        //Record owner send transaction
        let sender = new MultisigConfirm();
        sender.multisigTransactionId = request.transactionId;
        sender.internalChainId = request.internalChainId;
        sender.ownerAddress = request.owner;
        sender.status = MULTISIG_CONFIRM_STATUS.SEND;

        await this.multisigConfirmRepos.create(sender);

        await client.broadcastTx(encodeTransaction, 10);
      } catch (error) {
        this._logger.log(error);
        //Update status and txhash
        //TxHash is encoded transaction when send it to network
        if(typeof error.txId === 'undefined' || error.txId === null){
          multisigTransaction.status = TRANSACTION_STATUS.FAILED;
          await this.multisigTransactionRepos.update(multisigTransaction);
          this._logger.error(`${error.name}: ${error.message}`);
          this._logger.error(`${error.stack}`);
          return res.return(ErrorMap.E500, {'err': error.message});
        }
        else{
          multisigTransaction.status = TRANSACTION_STATUS.PENDING;
          multisigTransaction.txHash = error.txId;
          await this.multisigTransactionRepos.update(multisigTransaction);
        }        
      }

      return res.return(ErrorMap.SUCCESSFUL);

    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(error.message === ErrorMap.E500.Message ? ErrorMap.E500 : error.errorMap);
    }
  }

  async confirmTransaction( request: MODULE_REQUEST.ConfirmTransactionRequest,): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {

      //Check status of multisig transaction when confirm transaction
      let transaction = await this.multisigTransactionRepos.findOne({
        where: { id: request.transactionId, internalChainId: request.internalChainId }
      });

      if (!transaction) {
        throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
      }

      let checkOwner = await this.multisigConfirmRepos.validateOwner(request.fromAddress, transaction.fromAddress, request.internalChainId);

      if(checkOwner){
        throw new CustomError(ErrorMap.PERMISSION_DENIED);
      }

      //User has confirmed transaction before
      let checkOnwerHasSigned = await this.multisigConfirmRepos.checkUserHasSigned(request.transactionId, request.fromAddress);

      if(checkOnwerHasSigned){
        throw new CustomError(ErrorMap.USER_HAS_COMFIRMED);
      }

      await this.multisigConfirmRepos.insertIntoMultisigConfirm(request.transactionId, request.fromAddress, request.signature, request.bodyBytes, request.internalChainId, MULTISIG_CONFIRM_STATUS.CONFIRM);

      await this.multisigTransactionRepos.validateTransaction(request.transactionId, request.internalChainId);
      
      return res.return(ErrorMap.SUCCESSFUL);

    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(error.message === ErrorMap.E500.Message ? ErrorMap.E500 : error.errorMap);
    }
  }

  async rejectTransaction(request: MODULE_REQUEST.RejectTransactionParam): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      //Check status of multisig transaction when reject transaction
      let transaction = await this.multisigTransactionRepos.findOne({
        where: { id: request.transactionId, internalChainId: request.internalChainId },
      });

      if (!transaction) {
        throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
      }

      //Validate owner
      let checkOwner = await this.multisigConfirmRepos.validateOwner(request.fromAddress, transaction.fromAddress, request.internalChainId);

      if(checkOwner){
        throw new CustomError(ErrorMap.PERMISSION_DENIED);
      }

      //Check user has rejected transaction before
      let checkOnwerHasSigned = await this.multisigConfirmRepos.checkUserHasSigned(request.transactionId, request.fromAddress);

      if(checkOnwerHasSigned){
        throw new CustomError(ErrorMap.USER_HAS_REJECTED);
      }

      await this.multisigConfirmRepos.insertIntoMultisigConfirm(request.transactionId, request.fromAddress, '', '', request.internalChainId, MULTISIG_CONFIRM_STATUS.REJECT);

      return res.return(ErrorMap.SUCCESSFUL);
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(error.message === ErrorMap.E500.Message ? ErrorMap.E500 : error.errorMap);
    }
  }
}
