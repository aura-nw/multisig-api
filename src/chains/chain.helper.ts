/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { fromBase64, fromUtf8, toBase64 } from '@cosmjs/encoding';
import { AuthInfo, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Registry } from '@cosmjs/proto-signing';
import {
  AminoTypes,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createGovAminoConverters,
  createStakingAminoConverters,
  isAminoMsgBeginRedelegate,
  isAminoMsgDelegate,
  isAminoMsgMultiSend,
  isAminoMsgSend,
  isAminoMsgUndelegate,
} from '@cosmjs/stargate';
import { createWasmAminoConverters } from '@cosmjs/cosmwasm-stargate';
import { AminoMsg, makeSignDoc } from '@cosmjs/amino';
import {
  RegistryGeneratedTypes,
  TxTypeUrl,
} from '../common/constants/app.constant';
import {
  IMessage,
  IMsgMultiSend,
  IDecodedMessage,
  ICw20Msg,
} from '../modules/multisig-transaction/interfaces';
import { UserInfoDto } from '../modules/auth/dto';
import { Chain } from '../modules/chain/entities/chain.entity';
import { CustomError } from '../common/custom-error';
import { ErrorMap } from '../common/error.map';
import { ChainGateway } from './chain.gateway';
import { IMessageUnknown } from '../interfaces';
import { MultisigTransaction } from '../modules/multisig-transaction/entities/multisig-transaction.entity';

export class ChainHelper {
  constructor(public chain: Chain) {}

  async decodeAndVerifyTxInfo(
    authInfoBytes: string,
    bodyBytes: string,
    signature: string,
    accountNumber: number,
    creatorInfo: UserInfoDto,
  ) {
    const { chainId } = this.chain;

    const authInfoEncode = fromBase64(authInfoBytes);
    const decodedAuthInfo = AuthInfo.decode(authInfoEncode);
    const bodyBytesEncode = fromBase64(bodyBytes);
    const { memo, messages } = TxBody.decode(bodyBytesEncode);

    const sequence = decodedAuthInfo.signerInfos[0]?.sequence.toNumber();

    // build stdSignDoc for verify signature
    const registry = new Registry(RegistryGeneratedTypes);

    // stargate@0.28.11
    const aminoTypes = new AminoTypes({
      ...createBankAminoConverters(),
      ...createStakingAminoConverters(),
      ...createDistributionAminoConverters(),
      ...createGovAminoConverters(),
      ...createWasmAminoConverters(),
    });
    const decodedMsgs: IMessageUnknown[] = [];
    const msgs = messages.map((msg: IMessage) => {
      const decodedMsg = { ...msg };
      const decoder = registry.lookupType(msg.typeUrl);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      decodedMsg.value = decoder.decode(msg.value);
      decodedMsgs.push(decodedMsg);
      return aminoTypes.toAmino(decodedMsg);
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

    // verify signature; if verify fail, throw error
    const chainGateway = new ChainGateway(this.chain);
    const resultVerify = await chainGateway.verifySignature(
      signature,
      signDoc,
      creatorInfo,
    );

    if (!resultVerify) {
      throw new CustomError(ErrorMap.SIGNATURE_VERIFICATION_FAILED);
    }

    return {
      decodedAuthInfo,
      decodedMsgs,
      aminoMsgs: msgs,
      rawMsgs: this.getRawMsgs(decodedMsgs as IDecodedMessage[]),
      sequence,
      memo,
    };
  }

  getRawMsgs(decodedMsgs: IDecodedMessage[]): string {
    return JSON.stringify(
      decodedMsgs.map((decodeMsg) => {
        if (
          [
            TxTypeUrl.EXECUTE_CONTRACT.toString(),
            TxTypeUrl.INSTANTIATE_CONTRACT.toString(),
            TxTypeUrl.MIGRATE_CONTRACT.toString(),
          ].includes(decodeMsg.typeUrl)
        ) {
          const codeId =
            decodeMsg.typeUrl === TxTypeUrl.INSTANTIATE_CONTRACT.toString()
              ? {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                  codeId: decodeMsg.value.codeId.toString(),
                }
              : {};

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,
          return {
            ...decodeMsg,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value: {
              ...decodeMsg.value,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,
              ...codeId,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,
              msg: fromUtf8(decodeMsg.value.msg),
            },
          };
        }

        if (
          [
            TxTypeUrl.VOTE.toString(),
            TxTypeUrl.VOTE_WEIGHTED.toString(),
            TxTypeUrl.DEPOSIT.toString(),
          ].includes(decodeMsg.typeUrl)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const proposalId: string = decodeMsg.value.proposalId.toString();
          return {
            ...decodeMsg,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value: {
              ...decodeMsg.value,
              proposalId,
            },
          };
        }

        if (decodeMsg.typeUrl === TxTypeUrl.CREATE_VESTING_ACCOUNT.toString()) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const endTime: string = decodeMsg.value.endTime.toString();
          return {
            ...decodeMsg,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value: {
              ...decodeMsg.value,
              endTime,
            },
          };
        }

        if (decodeMsg.typeUrl === TxTypeUrl.IBC_TRANSFER.toString()) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const timeoutHeight = decodeMsg.value.timeoutHeight
            ? {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                revisionHeight:
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  decodeMsg.value.timeoutHeight?.revisionHeight.toString(),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                revisionNumber:
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  decodeMsg.value.timeoutHeight?.revisionHeight.toString(),
              }
            : '';

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const timeoutTimestamp: string =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            decodeMsg.value.timeoutTimestamp.toString();
          return {
            ...decodeMsg,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value: {
              ...decodeMsg.value,
              timeoutTimestamp,
              timeoutHeight: {
                ...timeoutHeight,
              },
            },
          };
        }

        if (decodeMsg.typeUrl === TxTypeUrl.STORE_CODE.toString()) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const wasmByteCode = toBase64(decodeMsg.value.wasmByteCode);
          return {
            ...decodeMsg,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value: {
              ...decodeMsg.value,
              wasmByteCode,
            },
          };
        }
        return decodeMsg;
      }),
    );
  }

  calculateAmount(aminoMsgs: AminoMsg[]): number {
    let total = 0;

    for (const msg of aminoMsgs) {
      switch (true) {
        case isAminoMsgSend(msg): {
          total += Number(msg.value.amount[0].amount);
          break;
        }
        case isAminoMsgMultiSend(msg): {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          total += msg.value.outputs.reduce(
            (acc: number, m: IMsgMultiSend) => acc + Number(m.coins[0].amount),
            0,
          );
          break;
        }
        case isAminoMsgDelegate(msg): {
          total += Number(msg.value.amount.amount);
          break;
        }
        default: {
          break;
        }
      }
    }
    return total;
  }

  getDataFromTx(
    transaction: MultisigTransaction,
    decodedMsgs: IMessageUnknown[],
    aminoMsgs: AminoMsg[],
  ): {
    amount: number;
    contractAddress?: string;
  } {
    if (
      transaction.typeUrl === TxTypeUrl.EXECUTE_CONTRACT &&
      transaction.toAddress !== '' &&
      !(decodedMsgs[0].value instanceof Uint8Array) &&
      decodedMsgs[0].value.msg instanceof Uint8Array
    ) {
      const contractAddress = decodedMsgs[0].value.contract;
      const decodedMsg = fromUtf8(decodedMsgs[0].value.msg);
      const objectMsg = JSON.parse(decodedMsg) as ICw20Msg;
      if (objectMsg.transfer.recipient !== transaction.toAddress) {
        throw new CustomError(
          ErrorMap.TRANSACTION_NOT_VALID,
          'recipient address is not match with address in msg',
        );
      }

      return {
        amount: Number(objectMsg.transfer.amount),
        contractAddress,
      };
    }

    return {
      amount: this.calculateAmount(aminoMsgs),
    };
  }
}
