import { StargateClient } from '@cosmjs/stargate';
import { CustomError } from 'src/common/customError';
import { ErrorMap } from 'src/common/error.map';
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

  public static async initNetworkAndGetBalance(
    tendermintUrl: string,
    safeAddress: string,
    denom: string,
  ) {
    try {
      const network = new Network(tendermintUrl);
      await network.init();
      const balance = await network.getBalance(safeAddress, denom);
      return [balance];
    } catch (error) {
      throw new CustomError(ErrorMap.GET_BALANCE_FAILED, error.message);
    }
  }

  getBalance(address: string, denom = 'uaura') {
    return this.client.getBalance(address, denom);
  }
}
