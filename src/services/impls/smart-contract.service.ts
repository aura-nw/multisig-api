import { coins, makeMultisignedTx, StargateClient } from '@cosmjs/stargate';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ErrorMap } from 'src/common/error.map';
import { ResponseDto } from 'src/dtos/responses';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from 'src/module.config';
import {
  IGeneralRepository,
  IMultisigConfirmRepository,
  IMultisigTransactionsRepository,
  IMultisigWalletOwnerRepository,
  IMultisigWalletRepository,
} from 'src/repositories';
import { ISmartContractService } from '../ismart-contract.service';
import { BaseService } from './base.service';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { fromBase64 } from '@cosmjs/encoding';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { CustomError } from 'src/common/customError';
import { ISmartContractRepository } from 'src/repositories/ismart-contract.repository';
import {
  MULTISIG_CONFIRM_STATUS,
  NETWORK_URL_TYPE,
  TRANSACTION_STATUS,
} from 'src/common/constants/app.constant';
import { ConfirmTransactionRequest } from 'src/dtos/requests';
import { SmartContractTx } from 'src/entities';
import { CommonUtil } from 'src/utils/common.util';

@Injectable()
export class SmartContractService
  extends BaseService
  implements ISmartContractService
{
  private readonly _logger = new Logger(SmartContractService.name);
  private readonly _commonUtil: CommonUtil = new CommonUtil();

  constructor(
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private chainRepos: IGeneralRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY)
    private multisigConfirmRepos: IMultisigConfirmRepository,
    @Inject(REPOSITORY_INTERFACE.ISMART_CONTRACT_REPOSITORY)
    private repos: ISmartContractRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_TRANSACTION_REPOSITORY)
    private multisigTransactionRepos: IMultisigTransactionsRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private safeRepos: IMultisigWalletRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_OWNER_REPOSITORY)
    private safeOwnerRepo: IMultisigWalletOwnerRepository,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Smart Contract Service ==============',
    );
  }

  async queryMessage(
    request: MODULE_REQUEST.QueryMessageRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const chain = await this.chainRepos.findOne({
        where: { id: request.internalChainId },
      });
      if (!chain) return res.return(ErrorMap.CHAIN_ID_NOT_EXIST);

      const client = await SigningCosmWasmClient.connect(chain.rpc);
      const contractOnchain = await client.getContract(request.contractAddress);
      console.log('Contract onchain: ', contractOnchain);

      const queryMsg = {};
      queryMsg[request.functionName] = request.param;
      const resultQuery = await client.queryContractSmart(
        request.contractAddress,
        queryMsg,
      );
      console.log('Query result: ', resultQuery);

      return res.return(ErrorMap.SUCCESSFUL, resultQuery);
    } catch (error) {
      return ResponseDto.responseError(SmartContractService.name, error);
    }
  }

  async createExecuteMessage(
    request: MODULE_REQUEST.ExecuteMessageRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const authInfo = await this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;
      // Validate safe
      const signResult = await this.signingInstruction(
        request.internalChainId,
        request.senderAddress,
      );

      // Validate execute transaction creator
      await this.multisigConfirmRepos.validateOwner(
        creatorAddress,
        request.senderAddress,
        request.internalChainId,
      );

      //Validate safe don't have tx pending
      await this.multisigTransactionRepos.validateCreateTx(
        request.senderAddress,
        request.internalChainId,
      );
      await this.repos.validateCreateTx(
        request.senderAddress,
        request.internalChainId,
      );

      const safe = await this.safeRepos.findOne({
        where: {
          safeAddress: request.senderAddress,
          internalChainId: request.internalChainId,
        },
      });

      // Safe data into DB
      const transactionResult = await this.repos.insertExecuteContract(
        request.senderAddress,
        request.contractAddress,
        request.functionName,
        JSON.stringify(request.param),
        request.gasLimit,
        request.fee,
        TRANSACTION_STATUS.AWAITING_CONFIRMATIONS,
        NETWORK_URL_TYPE.EXECUTE_CONTRACT,
        request.internalChainId,
        signResult.denom,
        signResult.accountNumber,
        signResult.sequence.toString(),
        safe.id,
      );

      const requestSign = new ConfirmTransactionRequest();
      requestSign.transactionId = transactionResult.id;
      requestSign.bodyBytes = request.bodyBytes;
      requestSign.signature = request.signature;
      requestSign.internalChainId = request.internalChainId;
      console.log(requestSign);

      // Sign to transaction
      await this.confirmExecuteMessage(requestSign);

      return res.return(ErrorMap.SUCCESSFUL, transactionResult.id, {
        'SmartContractTxId:': transactionResult.id,
      });
    } catch (error) {
      return ResponseDto.responseError(SmartContractService.name, error);
    }
  }

  async confirmExecuteMessage(
    request: MODULE_REQUEST.ConfirmTransactionRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const authInfo = await this._commonUtil.getAuthInfo();
      const ownerAddress = authInfo.address;
      const transaction = await this.repos.checkExistSmartContractTx(
        request.transactionId,
        request.internalChainId,
      );

      const validateOwner = await this.multisigConfirmRepos.validateOwner(
        ownerAddress,
        transaction.fromAddress,
        request.internalChainId,
      );
      console.log(validateOwner);

      //User has confirmed transaction before
      const userHasSigned = await this.multisigConfirmRepos.checkUserHasSigned(
        request.transactionId,
        ownerAddress,
      );
      console.log(userHasSigned);

      await this.multisigConfirmRepos.insertIntoMultisigConfirmContractType(
        request.transactionId,
        ownerAddress,
        request.signature,
        request.bodyBytes,
        request.internalChainId,
        MULTISIG_CONFIRM_STATUS.CONFIRM,
      );

      await this.repos.validateTransaction(
        request.transactionId,
        request.internalChainId,
      );

      return res.return(ErrorMap.SUCCESSFUL);
    } catch (error) {
      return ResponseDto.responseError(SmartContractService.name, error);
    }
  }

  async rejectExecuteMessage(
    request: MODULE_REQUEST.RejectTransactionParam,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const authInfo = await this._commonUtil.getAuthInfo();
      const ownerAddress = authInfo.address;
      //Check status of multisig transaction when reject transaction
      const transaction = await this.repos.checkExistSmartContractTx(
        request.transactionId,
        request.internalChainId,
      );

      //Validate owner
      await this.multisigConfirmRepos.validateOwner(
        ownerAddress,
        transaction.fromAddress,
        request.internalChainId,
      );

      //Check user has rejected transaction before
      await this.multisigConfirmRepos.checkUserHasSigned(
        request.transactionId,
        ownerAddress,
      );

      await this.multisigConfirmRepos.insertIntoMultisigConfirmContractType(
        request.transactionId,
        ownerAddress,
        '',
        '',
        request.internalChainId,
        MULTISIG_CONFIRM_STATUS.REJECT,
      );

      const rejectConfirms = await this.multisigConfirmRepos.findByCondition({
        smartContractTxId: request.transactionId,
        status: MULTISIG_CONFIRM_STATUS.REJECT,
      });

      const safeOwner = await this.safeOwnerRepo.findByCondition({
        safeId: transaction.safeId,
      });

      const safe = await this.safeRepos.findOne({
        where: { id: transaction.safeId },
      });

      if (safeOwner.length - rejectConfirms.length < safe.threshold) {
        transaction.status = TRANSACTION_STATUS.CANCELLED;
        await this.repos.update(transaction);
      }

      return res.return(ErrorMap.SUCCESSFUL);
    } catch (error) {
      return ResponseDto.responseError(SmartContractService.name, error);
    }
  }

  async sendExecuteMessage(
    request: MODULE_REQUEST.SendTransactionRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const authInfo = await this._commonUtil.getAuthInfo();
      const ownerAddress = authInfo.address;
      const chain = await this.chainRepos.findOne({
        where: { id: request.internalChainId },
      });

      const client = await StargateClient.connect(chain.rpc);

      // Get information of smart contract tx
      const smartContractTx = await this.repos.validateTxBroadcast(
        request.transactionId,
      );

      //Validate owner
      await this.multisigConfirmRepos.validateOwner(
        ownerAddress,
        smartContractTx.fromAddress,
        request.internalChainId,
      );

      //Make tx
      const txBroadcast = await this.makeTx(
        request.transactionId,
        smartContractTx,
      );

      try {
        await this.multisigConfirmRepos.insertIntoMultisigConfirmContractType(
          request.transactionId,
          ownerAddress,
          '',
          '',
          request.internalChainId,
          MULTISIG_CONFIRM_STATUS.SEND,
        );

        const result = await client.broadcastTx(txBroadcast);
        return res.return(ErrorMap.SUCCESSFUL, result);
      } catch (error) {
        console.log('Error', error);
        //Update status and txhash
        //TxHash is encoded transaction when send it to network
        if (typeof error.txId === 'undefined') {
          smartContractTx.status = TRANSACTION_STATUS.FAILED;
          await this.repos.update(smartContractTx);
          return ResponseDto.responseError(SmartContractService.name, error);
        } else {
          await this.repos.updateTxBroadcastSucces(
            smartContractTx.id,
            error.txId,
          );
          return res.return(ErrorMap.SUCCESSFUL, { TxHash: error.txId });
        }
      }
    } catch (error) {
      return ResponseDto.responseError(SmartContractService.name, error);
    }
  }

  async signingInstruction(
    internalChainId: number,
    sendAddress: string,
  ): Promise<any> {
    const chain = await this.chainRepos.findChain(internalChainId);
    const client = await StargateClient.connect(chain.rpc);

    //Check account
    const accountOnChain = await client.getAccount(sendAddress);
    if (!accountOnChain) {
      throw new CustomError(ErrorMap.E001);
    }

    return {
      accountNumber: accountOnChain.accountNumber,
      sequence: accountOnChain.sequence,
      chainId: chain.chainId,
      denom: chain.denom,
    };
  }

  async makeTx(
    transactionId: number,
    smartContractTx: SmartContractTx,
  ): Promise<any> {
    //Get safe info
    const safeInfo = await this.safeRepos.findOne({
      where: { id: smartContractTx.safeId },
    });
    //Get all signature of transaction
    const multisigConfirmArr = await this.multisigConfirmRepos.findByCondition({
      smartContractTxId: transactionId,
      status: MULTISIG_CONFIRM_STATUS.CONFIRM,
    });

    const addressSignarureMap = new Map<string, Uint8Array>();

    multisigConfirmArr.forEach((x) => {
      const encodeSignature = fromBase64(x.signature);
      addressSignarureMap.set(x.ownerAddress, encodeSignature);
    });

    //Fee
    const sendFee = {
      amount: coins(smartContractTx.fee, smartContractTx.denom),
      gas: smartContractTx.gas.toString(),
    };

    const encodedBodyBytes = fromBase64(multisigConfirmArr[0].bodyBytes);

    //Pubkey
    const safePubkey = JSON.parse(safeInfo.safePubkey);

    const executeTransaction = makeMultisignedTx(
      safePubkey,
      Number(smartContractTx.sequence),
      sendFee,
      encodedBodyBytes,
      addressSignarureMap,
    );

    const encodeTransaction = Uint8Array.from(
      TxRaw.encode(executeTransaction).finish(),
    );
    return encodeTransaction;
  }

  // async testCreateExecuteContract(request: MODULE_REQUEST.ExecuteMessageRequest) {
  //     const res = new ResponseDto();
  //     try {
  //         let chain = await this.chainRepos.findOne({ where: { id: request.internalChainId } });
  //         if (!chain) return res.return(ErrorMap.CHAIN_ID_NOT_EXIST);

  //         const client = await StargateClient.connect(chain.rpc);

  //         let signatures1 = 'qEFJVEFcHQAThmyOwlh9qgX0nn96WNNSNSPAmZZmVpU77z9q6VD9M8JTK/kgHrh8Zkehg9yYc2sT9hNiziQgfA=='
  //         let encodeSignature1 = fromBase64(signatures1)
  //         // let signatures2 = 'Bg7boP9N3ioQEFr6cu0Fq4Yq1IQqsSOUfSSSN0zFc056qYJ76w3mulnqoKLz4zdN9DkJB3m8vVAAyUpi82HXDw=='
  //         // let encodeSignature2 = fromBase64(signatures2)
  //         let addressSignarureMap = new Map<string, Uint8Array>();
  //         addressSignarureMap.set('aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa', encodeSignature1);
  //         // addressSignarureMap.set('aura136v0nmlv0saryev8wqz89w80edzdu3quzm0ve9', encodeSignature2)
  //         const sendFee = {
  //             amount: coins(140, 'uaura'),
  //             gas: '140000',
  //         };
  //         let encodedBodyBytes = fromBase64('CtoBCiQvY29zbXdhc20ud2FzbS52MS5Nc2dFeGVjdXRlQ29udHJhY3QSsQEKK2F1cmExdG04eWZzN25meTlrN243bXo3eTZxcW5keThwcjB0dTRqNDh1eTMSP2F1cmExbmE5aDh5MGhwd3RzNXhoa2Vjem1xYWptM2V5eTJuNWxzc25hdnAwaDAyenN4cGVjejRrczhoNTl0eBpBeyJhZGRfbmV3Ijp7ImlkIjoiZjExIiwibmFtZSI6InZpb2xldCIsImFtb3VudCI6MTUwLCJwcmljZSI6MTAwfX0SEUludGVyYWN0IGNvbnRyYWN0')
  //         const safePubkey = JSON.parse('{"type":"tendermint/PubKeyMultisigThreshold","value":{"threshold":"1","pubkeys":[{"type":"tendermint/PubKeySecp256k1","value":"A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"}]}}')
  //         let executeTransaction = makeMultisignedTx(
  //             safePubkey,
  //             1,
  //             sendFee,
  //             encodedBodyBytes,
  //             addressSignarureMap
  //         )
  //         console.log(executeTransaction)
  //         let encodeTransaction = Uint8Array.from(TxRaw.encode(executeTransaction).finish())
  //         const result = await client.broadcastTx(encodeTransaction)
  //         console.log(result)
  //         return res.return(ErrorMap.SUCCESSFUL, result)
  //     } catch (error) {
  //         return ResponseDto.responseError(SmartContractService.name, error);
  //     }
  // }
}
