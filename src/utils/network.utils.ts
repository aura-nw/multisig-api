import { StargateClient } from "@cosmjs/stargate";
import { ConfigService } from "src/shared/services/config.service";

export class Network {
  client: StargateClient;
  configServices: ConfigService;

  constructor(public tendermintUrl: string) { }

  async init() {
    this.client = await StargateClient.connect(this.tendermintUrl);
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