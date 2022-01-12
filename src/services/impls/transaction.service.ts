import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { ConfigService } from 'src/shared/services/config.service';
import { ITransactionService } from '../transaction.service';
import {
  makeMultisignedTx,
  MsgSendEncodeObject,
  SignerData,
  SigningStargateClient,
  StargateClient,
} from '@cosmjs/stargate';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { coins } from '@cosmjs/proto-signing';
import {
  encodeSecp256k1Pubkey,
  MultisigThresholdPubkey,
  Secp256k1HdWallet,
} from '@cosmjs/amino';
import { BaseService } from './base.service';
import { MultisigConfirm, MultisigTransaction } from 'src/entities';
import { IMultisigTransactionsRepository } from 'src/repositories/imultisig-transaction.repository';
import { MultisigTransactionHistoryResponse } from 'src/dtos/responses/multisig-transaction/multisig-transaction-history.response';
import { IMultisigConfirmRepository } from 'src/repositories/imultisig-confirm.repository';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
@Injectable()
export class TransactionService extends BaseService implements ITransactionService {
  private readonly _logger = new Logger(TransactionService.name);
  constructor(
    private configService: ConfigService,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_TRANSACTION_REPOSITORY) 
    private multisigTransactionRepos : IMultisigTransactionsRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY) 
    private multisigConfirmRepos : IMultisigConfirmRepository,
    private httpService: HttpService
  ) {
    super(multisigTransactionRepos);
    this._logger.log(
      '============== Constructor Transaction Service ==============',
    );
  }

  async createTransaction(request: MODULE_REQUEST.CreateTransactionRequest): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      let transaction = new MultisigTransaction();

      transaction.fromAddress = request.from;
      transaction.toAddress = request.to;
      transaction.amount = request.amount;
      transaction.gas = request.gasLimit;
      transaction.gasAmount = request.fee;

      await this.multisigTransactionRepos.create(transaction);

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
    const signingInstruction = await (async () => {
      const client = await StargateClient.connect(
        this.configService.get('TENDERMINT_URL'),
      );
      const accountOnChain = await client.getAccount(request.from);

      const msgSend: MsgSend = {
        fromAddress: request.from,
        toAddress: request.to,
        amount: coins(request.amount, request.denom),
      };
      const msg: MsgSendEncodeObject = {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: msgSend,
      };
      const gasLimit = request.gasLimit;
      const fee = {
        amount: coins(request.fee, request.denom),
        gas: request.gasLimit,
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

    const res = new ResponseDto();
    return res.return(ErrorMap.SUCCESSFUL, signingInstruction);
  }
  async singleSignTransaction(
    request: MODULE_REQUEST.SingleSignTransactionRequest,
  ): Promise<ResponseDto> {
    const wallet = await Secp256k1HdWallet.fromMnemonic(request.mnemonic, {
      prefix: this.configService.get('prefix'),
    });
    const pubkey = encodeSecp256k1Pubkey(
      (await wallet.getAccounts())[0].pubkey,
    );
    const address = (await wallet.getAccounts())[0].address;
    const signingClient = await SigningStargateClient.offline(wallet);

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
    let result = {};
    const res = new ResponseDto();
    return res.return(ErrorMap.SUCCESSFUL, result);
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
    const id = await this.multisigTransactionRepos.getMultisigTxId(internalTxHash);
    const result = await this.multisigConfirmRepos.getListConfirmMultisigTransaction(id);
    return res.return(ErrorMap.SUCCESSFUL, result);
  }

  async getTransactionHistory(safeAddress: string): Promise<ResponseDto> {
    const res = new ResponseDto();
    const result = await this.multisigTransactionRepos.getTransactionHistory(safeAddress);
    return res.return(ErrorMap.SUCCESSFUL, result);
  }

  async getAuraTxFromNode(safeAddress: string): Promise<ResponseDto> {
    const res = new ResponseDto();
    const url = 'http://18.138.28.51:1317/txs?message.sender=' + safeAddress + '&limit=20&page=1'
    const resApi =  await this.httpService.get(url).toPromise();
    const result = [];
    return res.return(ErrorMap.SUCCESSFUL, result);
  }

  async getTransactionHistoryFromNode(safeAddress: string): Promise<ResponseDto> {
    const res = new ResponseDto();
    const url = 'http://18.138.28.51:1317/txs?transfer.recipient=' + safeAddress + '&limit=20&page=1'
    const resApi =  await this.httpService.get(url).toPromise();
    // console.log(resApi.data);
    // const temp = eval(resApi.data.txs[0].raw_log);
    // const signs = eval(resApi.data.txs[0].tx.value.signatures);
    // console.log(temp[0].events[3].attributes);
    // console.log(signs)
    const result = [];
    for(let i = 0; i < resApi.data.count; i++) {
      const temp = eval(resApi.data.txs[i].raw_log);
      const trans = new MultisigTransactionHistoryResponse();
      trans.txHash = resApi.data.txs[i].txhash;
      trans.createdAt = resApi.data.txs[i].timestamp;
      trans.updatedAt = resApi.data.txs[i].timestamp;
      trans.amount = temp[0].events[3].attributes[2].value;
      trans.receiver = temp[0].events[3].attributes[0].value;
      // const confirms = MultisigConfirm[resApi.data.txs[i].tx.value.signatures.length];
      // for(let j = 0; j < res[i].signatures.length; j++) {
      //   confirms.
      // }
      // resApi.data.txs[i].tx.value.signatures.pub_key.value;
      // res[i].signatures = confirms;
      result.push(trans)
    }
    return res.return(ErrorMap.SUCCESSFUL, result);
  }
}
