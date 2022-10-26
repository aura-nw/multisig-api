import { StargateClient } from '@cosmjs/stargate';
import { ConfigService } from '../shared/services/config.service';

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
}
