import { Registry } from '@cosmjs/proto-signing';
import { AuthInfo, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { IMultisigTransactionService } from '../multisig-transaction.service';
import {
  AminoTypes,
  coins,
  makeMultisignedTx,
  StargateClient,
} from '@cosmjs/stargate';
import { fromBase64 } from '@cosmjs/encoding';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { BaseService } from './base.service';
import { MultisigTransaction } from 'src/entities';
import {
  MULTISIG_CONFIRM_STATUS,
  NETWORK_URL_TYPE,
  TRANSACTION_STATUS,
} from 'src/common/constants/app.constant';
import { CustomError } from 'src/common/customError';
import {
  IGeneralRepository,
  IMultisigConfirmRepository,
  IMultisigTransactionsRepository,
  IMultisigWalletOwnerRepository,
  IMultisigWalletRepository,
} from 'src/repositories';
import { ConfirmTransactionRequest } from 'src/dtos/requests';
import { ISmartContractRepository } from 'src/repositories/ismart-contract.repository';
import { getEvmosAccount, makeMultisignedTxEvmos } from 'src/chains/evmos';
import { CommonUtil } from 'src/utils/common.util';
import { Secp256k1, Secp256k1Signature, sha256 } from '@cosmjs/crypto';
import { makeSignDoc, serializeSignDoc, StdSignDoc } from '@cosmjs/amino';
import { createWasmAminoConverters } from '@cosmjs/cosmwasm-stargate';

@Injectable()
export class MultisigTransactionService
  extends BaseService
  implements IMultisigTransactionService
{
  private readonly _logger = new Logger(MultisigTransactionService.name);
  private readonly _commonUtil: CommonUtil = new CommonUtil();

  constructor(
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_TRANSACTION_REPOSITORY)
    private multisigTransactionRepos: IMultisigTransactionsRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY)
    private multisigConfirmRepos: IMultisigConfirmRepository,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private chainRepos: IGeneralRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private safeRepos: IMultisigWalletRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_OWNER_REPOSITORY)
    private safeOwnerRepo: IMultisigWalletOwnerRepository,
    @Inject(REPOSITORY_INTERFACE.ISMART_CONTRACT_REPOSITORY)
    private smartContractRepos: ISmartContractRepository,
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
      const authInfo = await this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;
      // if (!(await this.safeOwnerRepo.isSafeOwner(creatorAddress, request.from)))
      //   throw new CustomError(ErrorMap.ADDRESS_NOT_CREATOR);

      // decode data
      const authInfoBytes = fromBase64(request.authInfoBytes);
      const decodedAuthInfo = AuthInfo.decode(authInfoBytes);
      const bodyBytes = fromBase64(request.bodyBytes);
      const { memo, messages } = TxBody.decode(bodyBytes);

      // get accountNumber, sequence from chain
      const chain = await this.chainRepos.findChain(request.internalChainId);
      const client = await StargateClient.connect(chain.rpc);
      const { accountNumber, sequence } = await client.getSequence(
        request.from,
      );
      const chainId = await client.getChainId();

      // build signDoc
      const registry = new Registry();
      const aminoTypes = new AminoTypes({ ...createWasmAminoConverters() });
      const msgs = messages.map((msg: any) => {
        const decoder = registry.lookupType(msg.typeUrl);
        msg.value = decoder.decode(msg.value);
        return aminoTypes.toAmino(msg);
      });
      const stdFee = {
        amount: decodedAuthInfo.fee.amount,
        gas: decodedAuthInfo.fee.gasLimit.toString(),
      };
      const signDoc = makeSignDoc(
        msgs,
        stdFee,
        chainId,
        memo,
        accountNumber,
        sequence,
      );
      const pubKeyDecoded = Buffer.from(authInfo.pubkey, 'base64');

      // validate signature of fromAddress
      const valid = await Secp256k1.verifySignature(
        Secp256k1Signature.fromFixedLength(fromBase64(request.signature)),
        sha256(serializeSignDoc(signDoc)),
        pubKeyDecoded,
      );
      if (!valid) throw new CustomError(ErrorMap.VERIFY_SIGNATURE_FAIL);

      //Validate safe
      const signResult = await this.signingInstruction(
        request.internalChainId,
        request.from,
        request.amount,
      );

      //Validate transaction creator
      await this.multisigConfirmRepos.validateOwner(
        creatorAddress,
        request.from,
        request.internalChainId,
      );

      //Validate safe don't have tx pending
      await this.multisigTransactionRepos.validateCreateTx(request.from);
      await this.smartContractRepos.validateCreateTx(request.from);

      const safe = await this.safeRepos.findOne({
        where: { safeAddress: request.from },
      });

      //Safe data into DB
      const transactionResult =
        await this.multisigTransactionRepos.insertMultisigTransaction(
          request.from,
          request.to,
          request.amount,
          request.gasLimit,
          request.fee,
          signResult.accountNumber,
          messages[0].typeUrl,
          signResult.denom,
          TRANSACTION_STATUS.AWAITING_CONFIRMATIONS,
          request.internalChainId,
          signResult.sequence.toString(),
          safe.id,
        );

      const requestSign = new ConfirmTransactionRequest();
      requestSign.transactionId = transactionResult.id;
      requestSign.bodyBytes = request.bodyBytes;
      requestSign.signature = request.signature;
      requestSign.internalChainId = request.internalChainId;

      //Sign to transaction
      await this.confirmTransaction(requestSign);

      return res.return(ErrorMap.SUCCESSFUL, transactionResult.id, {
        'transactionId:': transactionResult.id,
      });
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async sendTransaction(
    request: MODULE_REQUEST.SendTransactionRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const authInfo = await this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;
      const chain = await this.chainRepos.findOne({
        where: { id: request.internalChainId },
      });

      const client = await StargateClient.connect(chain.rpc);

      //get information multisig transaction Id
      const multisigTransaction =
        await this.multisigTransactionRepos.validateTxBroadcast(
          request.transactionId,
        );

      //Validate owner
      await this.multisigConfirmRepos.validateOwner(
        creatorAddress,
        multisigTransaction.fromAddress,
        request.internalChainId,
      );

      //Make tx
      const txBroadcast = await this.makeTx(
        request.transactionId,
        multisigTransaction,
      );

      try {
        //Record owner send transaction
        await this.multisigConfirmRepos.insertIntoMultisigConfirm(
          request.transactionId,
          creatorAddress,
          '',
          '',
          request.internalChainId,
          MULTISIG_CONFIRM_STATUS.SEND,
        );

        await client.broadcastTx(txBroadcast, 10);
      } catch (error) {
        console.log('Error', error);
        //Update status and txhash
        //TxHash is encoded transaction when send it to network
        if (typeof error.txId === 'undefined' || error.txId === null) {
          multisigTransaction.status = TRANSACTION_STATUS.FAILED;
          await this.multisigTransactionRepos.update(multisigTransaction);
          return ResponseDto.responseError(
            MultisigTransactionService.name,
            error,
          );
        } else {
          await this.multisigTransactionRepos.updateTxBroadcastSucces(
            multisigTransaction.id,
            error.txId,
          );
          return res.return(ErrorMap.SUCCESSFUL, { TxHash: error.txId });
        }
      }
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async confirmTransaction(
    request: MODULE_REQUEST.ConfirmTransactionRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const authInfo = await this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;
      const transaction =
        await this.multisigTransactionRepos.checkExistMultisigTransaction(
          request.transactionId,
          request.internalChainId,
        );

      await this.multisigConfirmRepos.validateOwner(
        creatorAddress,
        transaction.fromAddress,
        request.internalChainId,
      );

      //User has confirmed transaction before
      await this.multisigConfirmRepos.checkUserHasSigned(
        request.transactionId,
        creatorAddress,
      );

      await this.multisigConfirmRepos.insertIntoMultisigConfirm(
        request.transactionId,
        creatorAddress,
        request.signature,
        request.bodyBytes,
        request.internalChainId,
        MULTISIG_CONFIRM_STATUS.CONFIRM,
      );

      await this.multisigTransactionRepos.validateTransaction(
        request.transactionId,
        request.internalChainId,
      );

      return res.return(ErrorMap.SUCCESSFUL);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async rejectTransaction(
    request: MODULE_REQUEST.RejectTransactionParam,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const authInfo = await this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;
      //Check status of multisig transaction when reject transaction
      const transaction =
        await this.multisigTransactionRepos.checkExistMultisigTransaction(
          request.transactionId,
          request.internalChainId,
        );

      //Validate owner
      await this.multisigConfirmRepos.validateOwner(
        creatorAddress,
        transaction.fromAddress,
        request.internalChainId,
      );

      //Check user has rejected transaction before
      await this.multisigConfirmRepos.checkUserHasSigned(
        request.transactionId,
        creatorAddress,
      );

      await this.multisigConfirmRepos.insertIntoMultisigConfirm(
        request.transactionId,
        creatorAddress,
        '',
        '',
        request.internalChainId,
        MULTISIG_CONFIRM_STATUS.REJECT,
      );

      const rejectConfirms = await this.multisigConfirmRepos.findByCondition({
        multisigTransactionId: request.transactionId,
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
        await this.multisigTransactionRepos.update(transaction);
      }

      return res.return(ErrorMap.SUCCESSFUL);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async signingInstruction(
    internalChainId: number,
    sendAddress: string,
    amount: number,
  ): Promise<any> {
    const chain = await this.chainRepos.findChain(internalChainId);
    const client = await StargateClient.connect(chain.rpc);

    const balance = await client.getBalance(sendAddress, chain.denom);
    if (Number(balance.amount) < amount) {
      throw new CustomError(ErrorMap.BALANCE_NOT_ENOUGH);
    }

    //Check account
    let sequence: number, accountNumber: number;
    switch (chain.denom) {
      case 'atevmos':
        const accountInfo = await getEvmosAccount(chain.rest, sendAddress);
        sequence = accountInfo.sequence;
        accountNumber = accountInfo.accountNumber;
        break;
      default:
        const accountOnChain = await client.getAccount(sendAddress);
        if (!accountOnChain) {
          throw new CustomError(ErrorMap.E001);
        }
        sequence = accountOnChain.sequence;
        accountNumber = accountOnChain.accountNumber;
    }
    return {
      accountNumber,
      sequence,
      chainId: chain.chainId,
      denom: chain.denom,
    };
  }

  async makeTx(
    transactionId: number,
    multisigTransaction: MultisigTransaction,
  ): Promise<any> {
    //Get safe info
    const safeInfo = await this.safeRepos.findOne({
      where: { id: multisigTransaction.safeId },
    });

    const chain = await this.chainRepos.findChain(safeInfo.internalChainId);

    //Get all signature of transaction
    const multisigConfirmArr = await this.multisigConfirmRepos.findByCondition({
      multisigTransactionId: transactionId,
      status: MULTISIG_CONFIRM_STATUS.CONFIRM,
    });

    const addressSignarureMap = new Map<string, Uint8Array>();

    multisigConfirmArr.forEach((x) => {
      const encodeSignature = fromBase64(x.signature);
      addressSignarureMap.set(x.ownerAddress, encodeSignature);
    });

    //Fee
    const sendFee = {
      amount: coins(multisigTransaction.fee, multisigTransaction.denom),
      gas: multisigTransaction.gas.toString(),
    };

    const encodedBodyBytes = fromBase64(multisigConfirmArr[0].bodyBytes);

    //Pubkey
    const safePubkey = JSON.parse(safeInfo.safePubkey);

    let executeTransaction;
    if (chain.denom === 'atevmos') {
      executeTransaction = makeMultisignedTxEvmos(
        safePubkey,
        Number(multisigTransaction.sequence),
        sendFee,
        encodedBodyBytes,
        addressSignarureMap,
      );
    } else {
      executeTransaction = makeMultisignedTx(
        safePubkey,
        Number(multisigTransaction.sequence),
        sendFee,
        encodedBodyBytes,
        addressSignarureMap,
      );
    }

    const encodeTransaction = Uint8Array.from(
      TxRaw.encode(executeTransaction).finish(),
    );
    return encodeTransaction;
  }
}
