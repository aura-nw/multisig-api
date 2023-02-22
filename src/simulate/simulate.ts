import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Chain } from '../modules/chain/entities/chain.entity';
import { Safe } from '../modules/safe/entities/safe.entity';
import { LcdClient } from '../shared/services/lcd-client.service';
import { SimulateResponse } from './dtos/simulate-response';
import { WalletSimulate } from './wallet.simulate';

@Injectable()
export class Simulate {
  private mnemonic: string;

  private chainWalletMap = new Map<string, WalletSimulate>();

  private currentWallet: WalletSimulate;

  constructor(
    private readonly configService: ConfigService,
    private readonly lcdClient: LcdClient,
  ) {
    this.mnemonic = this.configService.get<string>('SYS_MNEMONIC');
  }

  async simulateWithChain(chain: Chain): Promise<void> {
    let wallet = this.chainWalletMap.get(chain.chainId);
    if (!wallet) {
      wallet = new WalletSimulate(this.mnemonic, chain);
      await wallet.initialize();
      this.chainWalletMap.set(chain.chainId, wallet);
    }
    this.currentWallet = wallet;
  }

  getCurrentWallet(): WalletSimulate {
    return this.currentWallet;
  }

  async simulate(messages: any[], safeInfo: Safe): Promise<SimulateResponse> {
    const encodedBodyBytes = await this.currentWallet.buildEncodedTxBytes(
      messages,
      safeInfo,
    );
    // call simulate api
    const result = await this.lcdClient.simulate(encodedBodyBytes);
    return result;
  }
}
