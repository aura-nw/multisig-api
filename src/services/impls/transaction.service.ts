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
import { ITransactionRepository } from 'src/repositories/itransaction.repository';
import { BaseService } from './base.service';
@Injectable()
export class TransactionService extends BaseService implements ITransactionService {
  private readonly _logger = new Logger(TransactionService.name);
  constructor(
    private configService: ConfigService,
    @Inject(REPOSITORY_INTERFACE.ITRANSACTION_REPOSITORY)
    private transactionRepo: ITransactionRepository,
  ) {
    super(transactionRepo);
    this._logger.log(
      '============== Constructor Transaction Service ==============',
    );
  }
  
  async createTransaction(
    request: MODULE_REQUEST.CreateTransactionRequest,
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
    const id = await this.transactionRepo.getMultisigTxId(internalTxHash);
    const result = await this.transactionRepo.getListConfirmMultisigTransaction(id);
    return res.return(ErrorMap.SUCCESSFUL, result);
  }
}
