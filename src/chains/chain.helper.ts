import { fromBase64, fromUtf8 } from '@cosmjs/encoding';
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
} from '../modules/multisig-transaction/interfaces';
import { UserInfoDto } from '../modules/auth/dto';
import { Chain } from '../modules/chain/entities/chain.entity';
import { CustomError } from '../common/custom-error';
import { ErrorMap } from '../common/error.map';
import { ChainGateway } from './chain.gateway';
import { IMessageUnknown } from '../interfaces';

export class ChainHelper {
  constructor(public chain: Chain) {}

  async decodeAndVerifyTxInfo(
    authInfoBytes: string,
    bodyBytes: string,
    signature: string,
    accountNumber: number,
    creatorInfo: UserInfoDto,
  ) {
    const { chainId, prefix } = this.chain;

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
      ...createStakingAminoConverters(prefix),
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          return {
            ...decodeMsg,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value: {
              ...decodeMsg.value,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
              msg: fromUtf8(decodeMsg.value.msg),
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          total += Number(msg.value.amount[0].amount);
          break;
        }
        case isAminoMsgMultiSend(msg): {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          total += msg.value.outputs.reduce(
            (acc: number, m: IMsgMultiSend) => acc + Number(m.coins[0].amount),
            0,
          );
          break;
        }
        case isAminoMsgDelegate(msg):
        case isAminoMsgBeginRedelegate(msg):
        case isAminoMsgUndelegate(msg): {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
}
