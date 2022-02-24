import { StargateClient } from '@cosmjs/stargate';
import { ConfigService } from 'src/shared/services/config.service';

export class Network {
  client: StargateClient;
  configServices: ConfigService;

  constructor(public tendermintUrl: string) {}

  async init() {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        return reject(
          new Error(`Cannot connect to tendermintUrl: ${this.tendermintUrl}`),
        );
      }, 10000);
      try {
        this.client = await StargateClient.connect(this.tendermintUrl);
      } catch (error) {
        return reject(error);
      }
      if (this.client) clearTimeout(timeout);
      return resolve({});
    });
  }

  public static async defaultNetwork() {
    const configService: ConfigService = new ConfigService();
    const tendermintUrl = configService.get('TENDERMINT_URL');
    const network = new Network(tendermintUrl);
    await network.init();
    return network;
  }

  getBalance(address: string, denom = 'uaura') {
    return this.client.getBalance(address, denom);
  }
}
