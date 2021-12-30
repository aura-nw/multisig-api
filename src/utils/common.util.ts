import { Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { ConfigService, ENV_CONFIG } from '../shared/services/config.service';

export class CommonUtil {
  private configService: ConfigService = new ConfigService();
  constructor() {}

  /**
   * Calculate address from public key
   * @param pubkey public key
   * @returns address string
   */
  public pubkeyToAddress(pubkey: Pubkey): string {
    return pubkeyToAddress(pubkey, this.configService.get('PREFIX'));
  }
}
