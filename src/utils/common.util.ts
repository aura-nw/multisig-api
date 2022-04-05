import {
  createMultisigThresholdPubkey,
  Pubkey,
  pubkeyToAddress,
  SinglePubkey,
} from '@cosmjs/amino';
import { PUBKEY_TYPES } from 'src/common/constants/app.constant';
import { ConfigService, ENV_CONFIG } from '../shared/services/config.service';

export class CommonUtil {
  private configService: ConfigService = new ConfigService();
  constructor() {}

  /**
   * Calculate address from public key
   * @param pubkey public key
   * @returns address string
   */
  public pubkeyToAddress(
    pubkey: Pubkey,
    prefix = this.configService.get('PREFIX'),
  ): string {
    return pubkeyToAddress(pubkey, prefix);
  }

  /**
   * https://stackoverflow.com/a/34890276
   * @param xs
   * @param key
   * @returns
   */
  public groupBy<TItem>(xs: TItem[], key: string): { [key: string]: TItem[] } {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  /**
   * https://stackoverflow.com/a/54974076/8461456
   * @param arr
   * @returns boolean
   */
  public checkIfDuplicateExists(arr): boolean {
    return new Set(arr).size !== arr.length;
  }

  /**
   *
   * @param strArr
   * @returns string[]
   */
  public filterEmptyInStringArray(strArr: string[]): string[] {
    return strArr.filter((e) => {
      return e !== '';
    });
  }

  createSafeAddressAndPubkey(
    pubKeyArrString: string[],
    threshold: number,
    prefix: string,
  ): {
    pubkey: string;
    address: string;
  } {
    const arrPubkeys = pubKeyArrString.map(this.createPubkeys);
    const multisigPubkey = createMultisigThresholdPubkey(arrPubkeys, threshold);
    const multiSigWalletAddress = this.pubkeyToAddress(multisigPubkey, prefix);
    return {
      pubkey: JSON.stringify(multisigPubkey),
      address: multiSigWalletAddress,
    };
  }

  private createPubkeys(value: string): SinglePubkey {
    const result: SinglePubkey = {
      type: PUBKEY_TYPES.SECP256K1,
      value,
    };
    return result;
  }
}
