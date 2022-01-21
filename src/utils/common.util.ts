import { Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { ConfigService, ENV_CONFIG } from '../shared/services/config.service';

export class CommonUtil {
  private configService: ConfigService = new ConfigService();
  constructor() { }

  /**
   * Calculate address from public key
   * @param pubkey public key
   * @returns address string
   */
  public pubkeyToAddress(pubkey: Pubkey): string {
    return pubkeyToAddress(pubkey, this.configService.get('PREFIX'));
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
    return new Set(arr).size !== arr.length
  }
}
