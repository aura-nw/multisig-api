import { isNil, omitBy } from 'lodash';
import fetch from 'node-fetch';
import {
  createMultisigThresholdPubkey,
  encodeAminoPubkey,
  Pubkey,
  pubkeyToAddress,
  SinglePubkey,
} from '@cosmjs/amino';
import { sha256 } from '@cosmjs/crypto';
import { toBech32, toHex } from '@cosmjs/encoding';
import {
  Fee,
  LCDClient,
  LegacyAminoMultisigPublicKey,
  MsgSend,
  MultiSignature,
  SignatureV2,
  SimplePublicKey,
} from '@terra-money/terra.js';
import { plainToInstance } from 'class-transformer';
import { readFile } from 'graceful-fs';
import {
  createMultisigThresholdPubkeyEvmos,
  encodeAminoPubkeySupportEvmos,
} from '../chains/evmos';
import { PubkeyTypes } from '../common/constants/app.constant';
import { CustomError } from '../common/custom-error';
import { ErrorMap } from '../common/error.map';
import { AuthService } from '../modules/auth/auth.service';
import { MultisigTransaction } from '../modules/multisig-transaction/entities/multisig-transaction.entity';
import { UserInfoDto } from '../modules/auth/dto/user-info.dto';

interface ISafe {
  safePubkey;
}
export class CommonUtil {
  /**
   * Calculate address from public key
   * @param pubkey public key
   * @returns address string
   */
  public static pubkeyToAddress(pubkey: Pubkey, prefix: string): string {
    if (prefix === 'evmos' || prefix === 'canto') {
      const ethermintHelper = new EthermintHelper();
      const pubkeyAmino =
        ethermintHelper.encodeAminoPubkeySupportEthermint(pubkey);
      console.log(toHex(pubkeyAmino));
      const rawAddress = sha256(pubkeyAmino).slice(0, 20);
      const address = toBech32(prefix, rawAddress);
      return address;
    }
    const pubkeyData = encodeAminoPubkey(pubkey);

    const rawAddress = sha256(pubkeyData).slice(0, 20);
    const address = toBech32(prefix, rawAddress);
    console.log(address);

    return pubkeyToAddress(pubkey, prefix);
  }

  /**
   * https://stackoverflow.com/a/54974076/8461456
   * @param arr
   * @returns boolean
   */
  public static checkIfDuplicateExists(arr): boolean {
    return new Set(arr).size !== arr.length;
  }

  /**
   *
   * @param strArr
   * @returns string[]
   */
  public filterEmptyInStringArray(strArr: string[]): string[] {
    return strArr.filter((e) => e !== '');
  }

  static createSafeAddressAndPubkey(
    pubKeyArrString: string[],
    threshold: number,
    prefix: string,
  ): {
    pubkey: string;
    address: string;
  } {
    const ethermintHelper = new EthermintHelper();
    try {
      let arrPubkeys;
      arrPubkeys =
        prefix === 'evmos'
          ? pubKeyArrString.map(this.createPubkeyEvmos)
          : pubKeyArrString.map(this.createPubkeys);

      let multisigPubkey;
      multisigPubkey =
        prefix === 'evmos'
          ? createMultisigThresholdPubkeyEvmos(arrPubkeys, threshold)
          : createMultisigThresholdPubkey(arrPubkeys, threshold);
      const multiSigWalletAddress = this.pubkeyToAddress(
        multisigPubkey,
        prefix,
      );
      return {
        pubkey: JSON.stringify(multisigPubkey),
        address: multiSigWalletAddress,
      };
    } catch (error) {
      throw new CustomError(ErrorMap.CANNOT_CREATE_SAFE_ADDRESS, error.message);
    }
  }

  static createPubkeyEvmos(value: string): SinglePubkey {
    const result: SinglePubkey = {
      type: 'ethermint/PubKeyEthSecp256k1',
      value,
    };
    return result;
  }

  static createPubkeys(value: string): SinglePubkey {
    const result: SinglePubkey = {
      type: 'tendermint/PubKeySecp256k1',
      value,
    };
    return result;
  }

  async makeTerraTx(
    multisigTransaction: MultisigTransaction,
    safe: ISafe,
    multisigConfirmArr: any[],
    client: LCDClient,
  ) {
    const multisigPubkey = LegacyAminoMultisigPublicKey.fromAmino(
      JSON.parse(safe.safePubkey),
    );
    const multisig = new MultiSignature(multisigPubkey);

    const amount = {};
    amount[multisigTransaction.denom] = multisigTransaction.amount;
    const send = new MsgSend(
      multisigTransaction.fromAddress,
      multisigTransaction.toAddress,
      amount,
    );

    const tx = await client.tx.create(
      [
        {
          address: multisigTransaction.fromAddress,
          sequenceNumber: Number(multisigTransaction.sequence),
          publicKey: multisigPubkey,
        },
      ],
      {
        msgs: [send],
        fee: new Fee(
          multisigTransaction.gas,
          multisigTransaction.fee + multisigTransaction.denom,
        ),
        gas: multisigTransaction.gas.toString(),
      },
    );

    const addressSignarureMap = [];
    multisigConfirmArr.forEach((x) => {
      const pubkeyAmino: SimplePublicKey.Amino = {
        type: PubkeyTypes.SECP256K1,
        value: x.pubkey,
      };
      const amino: SignatureV2.Amino = {
        signature: x.signature,
        pub_key: pubkeyAmino,
      };
      const sig = SignatureV2.fromAmino(amino);
      addressSignarureMap.push(sig);
    });

    multisig.appendSignatureV2s(addressSignarureMap);
    tx.appendSignatures([
      new SignatureV2(
        multisigPubkey,
        multisig.toSignatureDescriptor(),
        Number(multisigTransaction.sequence),
      ),
    ]);

    return tx;
  }

  getAuthInfo(): UserInfoDto {
    const currentUser = AuthService.getAuthUser();
    if (!currentUser) throw new CustomError(ErrorMap.UNAUTHRORIZED);
    return plainToInstance(UserInfoDto, currentUser);
  }

  jsonReader(filePath, cb) {
    readFile(filePath, 'utf-8', (error, fileData) => {
      if (error) {
        return cb && cb(error);
      }
      try {
        const object = JSON.parse(fileData);
        return cb && cb(null, object);
      } catch (error) {
        return cb && cb(error);
      }
    });
  }

  public static async requestAPI(url: string, method = 'GET', body?: any) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const result = await fetch(url, options);

    const data = await result.json();
    if (result.status !== 200) {
      throw new CustomError(
        ErrorMap.REQUEST_ERROR,
        `${new URL(url).host} ${result.status} ${data.message} `,
      );
    }

    return data;
  }

  getPercentage(number: any, sum: any): string {
    if (number === 0) {
      return '0';
    }
    return ((+number * 100) / sum).toFixed(2);
  }

  omitByNil = (obj: any) => omitBy(obj, isNil);
}
