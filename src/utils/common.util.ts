import { isNil, omitBy } from 'lodash';
import {
  createMultisigThresholdPubkey,
  Pubkey,
  pubkeyToAddress,
  SinglePubkey,
} from '@cosmjs/amino';
import { sha256 } from '@cosmjs/crypto';
import { toBech32 } from '@cosmjs/encoding';
import { plainToInstance } from 'class-transformer';

import { CustomError } from '../common/custom-error';
import { ErrorMap } from '../common/error.map';
import { AuthService } from '../modules/auth/auth.service';
import { UserInfoDto } from '../modules/auth/dto/user-info.dto';
import { EthermintHelper } from '../chains/ethermint/ethermint.helper';
import { createEthSecp256k1Pubkey } from '../chains/ethermint/EthSecp256k1Pubkey';

export class CommonUtil {
  /**
   * getStrProp https://stackoverflow.com/a/70031969/8461456
   * @param o
   * @param prop
   * @returns
   */
  public static getStrProp(o: unknown, prop: string): string {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const p = (o as any)[prop];
      if (typeof p === 'string') {
        return p;
      }
    } catch {
      // ignore
    }
    return undefined;
  }

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

      const rawAddress = sha256(pubkeyAmino).slice(0, 20);
      const address = toBech32(prefix, rawAddress);
      return address;
    }

    /**
     * Another way to get bech32 address:
     * const pubkeyData = encodeAminoPubkey(pubkey);
     * const rawAddress = sha256(pubkeyData).slice(0, 20);
     * toBech32(prefix, rawAddress);
     */

    return pubkeyToAddress(pubkey, prefix);
  }

  /**
   * https://stackoverflow.com/a/54974076/8461456
   * @param arr
   * @returns boolean
   */
  public static checkIfDuplicateExists(arr: unknown[]): boolean {
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
      const arrPubkeys =
        prefix === 'evmos' || prefix === 'canto'
          ? pubKeyArrString.map((pk) => createEthSecp256k1Pubkey(pk))
          : pubKeyArrString.map((pk) => this.createPubkeys(pk));

      const multisigPubkey =
        prefix === 'evmos' || prefix === 'canto'
          ? ethermintHelper.createMultisigThresholdPubkeyEthermint(
              arrPubkeys,
              threshold,
            )
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
      throw CustomError.fromUnknown(ErrorMap.CANNOT_CREATE_SAFE_ADDRESS, error);
    }
  }

  static createPubkeys(value: string): SinglePubkey {
    const result: SinglePubkey = {
      type: 'tendermint/PubKeySecp256k1',
      value,
    };
    return result;
  }

  getAuthInfo(): UserInfoDto {
    const currentUser = AuthService.getAuthUser();
    if (!currentUser) throw new CustomError(ErrorMap.UNAUTHRORIZED);
    return plainToInstance(UserInfoDto, currentUser);
  }

  omitByNil = (obj: unknown) => omitBy(obj, isNil);
}
