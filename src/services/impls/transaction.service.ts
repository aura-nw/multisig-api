import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { ConfigService } from 'src/shared/services/config.service';
import { ITransactionService } from '../transaction.service';
import {
  MsgSendEncodeObject,
  StargateClient,
} from '@cosmjs/stargate';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { coins } from '@cosmjs/proto-signing';
import { BaseService } from './base.service';
import { DENOM, TRANSACTION_STATUS } from 'src/common/constants/api.constant';
import { ITransactionRepository } from 'src/repositories/itransaction.repository';
import { IMultisigConfirmRepository } from 'src/repositories/imultisig-confirm.repository';
import { IMultisigTransactionsRepository } from 'src/repositories/imultisig-transaction.repository';
import { MultisigConfirm, MultisigTransaction } from 'src/entities';
@Injectable()
export class TransactionService extends BaseService implements ITransactionService {
  private readonly _logger = new Logger(TransactionService.name);
  constructor(
    private configService: ConfigService,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_TRANSACTION_REPOSITORY) 
    private multisigTransactionRepos : IMultisigTransactionsRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY) 
    private multisigConfirmRepos : IMultisigConfirmRepository,
    @Inject(REPOSITORY_INTERFACE.ITRANSACTION_REPOSITORY)
    private transRepos: ITransactionRepository,
  ) {
    super(multisigTransactionRepos);
    this._logger.log(
      '============== Constructor Transaction Service ==============',
    );
  }

  async createTransaction(request: MODULE_REQUEST.CreateTransactionRequest): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      //check balance
      // let client = await StargateClient.connect(this.configService.get('TENDERMINT_URL'));

      // let multisigBalance = client.getBalance(request.from, DENOM.uaura);

      let transaction = new MultisigTransaction();

      transaction.fromAddress = request.from;
      transaction.toAddress = request.to;
      transaction.amount = request.amount;
      transaction.gas = request.gasLimit;
      transaction.gasAmount = request.fee;
      transaction.denom = DENOM.uaura;
      transaction.status = TRANSACTION_STATUS.PENDING;

      await this.multisigTransactionRepos.create(transaction);

    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500);
    }
  }

  async sendTransaction(request: MODULE_REQUEST.SendTransactionRequest): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      //get information multisig transaction Id
      let multisigTransaction = await this.multisigTransactionRepos.findOne({where: {id: request.transactionId}});

      if(!multisigTransaction && multisigTransaction.status != TRANSACTION_STATUS.SEND_WAITING){
        return res.return(ErrorMap.TRANSACTION_NOT_VALID);
      }

      const signingInstruction = await (async () => {
        const client = await StargateClient.connect(
          this.configService.get('TENDERMINT_URL'),
        );
        const accountOnChain = await client.getAccount(multisigTransaction.fromAddress);
  
        const msgSend: MsgSend = {
          fromAddress: multisigTransaction.fromAddress,
          toAddress: multisigTransaction.toAddress,
          amount: coins(multisigTransaction.amount, multisigTransaction.denom),
        };
        const msg: MsgSendEncodeObject = {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: msgSend,
        };
        const gasLimit = multisigTransaction.gasAmount;
        const fee = {
          amount: coins(multisigTransaction.gas, multisigTransaction.denom),
          gas: multisigTransaction.gasAmount,
        };
        let result = {
          accountNumber: accountOnChain ? accountOnChain.accountNumber : 0,
          sequence: accountOnChain ? accountOnChain.sequence : 0,
          chainId: this.configService.get('chain_id'),
          msgs: [msg],
          fee: fee,
          memo: request.memo,
        };

        return result;
      })();
      
      return res.return(ErrorMap.SUCCESSFUL);
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500);
    }
  }

  async singleSignTransaction(request: MODULE_REQUEST.SingleSignTransactionRequest): Promise<ResponseDto> 
  {
    const res = new ResponseDto();
    try {
      //Check status of multisig transaction
      let transaction = await this.multisigTransactionRepos.findOne({where : {id: request.transactionId }});

      if(!transaction  || transaction.status != TRANSACTION_STATUS.PENDING){
        return res.return(ErrorMap.TRANSACTION_NOT_EXIST);
      }

      let multisigConfirm = new MultisigConfirm();
      multisigConfirm.multisigTransactionId = request.transactionId;
      multisigConfirm.ownerAddress = request.multisigAddress;
      multisigConfirm.signature = request.signature;
      multisigConfirm.bodyBytes = request.bodyBytes;

      await this.multisigConfirmRepos.create(multisigConfirm);
      return res.return(ErrorMap.SUCCESSFUL);
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500);
    }

    // get singingInstruction created before
    // const signingInstruction = await this.cacheManager.get('resultCreateTransaction');

    // const signerData: SignerData = {
    // 	accountNumber: signingInstruction['accountNumber'],
    // 	sequence: signingInstruction['sequence'],
    // 	chainId: signingInstruction['chainId'],
    // };

    // sign transaction

    // const { bodyBytes: bb, signatures } = await signingClient.sign(
    // 	address,
    // 	signingInstruction['msgs'],
    // 	signingInstruction['fee'],
    // 	signingInstruction['memo'],
    // 	signerData,
    // );
    // let result = {
    // 	bodyBytes: bb,
    // 	signature: signatures
    // }
  }
  
  async broadcastTransaction(
    request: MODULE_REQUEST.BroadcastTransactionRequest,
  ): Promise<ResponseDto> {
    // get multisig pubkey
    // let multisigPubkey: MultisigThresholdPubkey = await this.cacheManager.get('resultCreateMultisig');

    // get signingInstruction created before
    // const signingInstruction = await this.cacheManager.get('resultSingleSignTransaction');

    // get all signature for this transaction
    // let resultSig1 = await this.cacheManager.get(`resultSign${address1}`);
    // let resultSig2 = await this.cacheManager.get(`resultSign${address2}`);

    // get all address signed this transaction
    // let address1 = await this.cacheManager.get('address1');
    // let address2 = await this.cacheManager.get('address2');

    // get bodyBytes of transaction
    // let bodyBytes = resultSig1['bodyBytes'];
    // let sig1 = resultSig1['signature'];
    // let sig2 = resultSig2['signature'];

    // const signedTx = makeMultisignedTx(
    // 	JSON.parse(multisigPubkey['pubkey']),
    // 	signingInstruction['sequence'],
    // 	fee,
    // 	bodyBytes,
    // 	new Map<string, Uint8Array>([
    // 		[address1, sig1],
    // 		[address2, sig2],
    // 	]),
    // );
    // console.log(signedTx);
    // const result = await broadcaster.broadcastTx(Uint8Array.from(TxRaw.encode(signedTx).finish()));

    let result = {};
    const res = new ResponseDto();
    return res.return(ErrorMap.SUCCESSFUL, result);
  }
  
  async getListConfirmMultisigTransaction(
    internalTxHash: string,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    const resId = await this.multisigTransactionRepos.getMultisigTxId(internalTxHash);
    if(resId) {
      const result = await this.multisigConfirmRepos.getListConfirmMultisigTransaction(resId.id);
      return res.return(ErrorMap.SUCCESSFUL, result);
    } else {
      return res.return(ErrorMap.TRANSACTION_NOT_EXIST)
    }
  }

  async getTransactionHistory(safeAddress: string, page: number): Promise<ResponseDto> {
    const res = new ResponseDto();
    // const result = await this.multisigTransactionRepos.getTransactionHistory(safeAddress);
    const result = await this.transRepos.getAuraTx(safeAddress, page);
    for(let i = 0; i < result.length; i++) {
      if(result[i].fromAddress == safeAddress) {
        result[i].signatures = await (await this.getListConfirmMultisigTransaction(result[i].txHash)).Data;
      }
    }
    return res.return(ErrorMap.SUCCESSFUL, result);
  }
}
