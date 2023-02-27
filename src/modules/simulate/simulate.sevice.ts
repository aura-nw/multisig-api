import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Chain } from '../chain/entities/chain.entity';
import { Safe } from '../safe/entities/safe.entity';
import { LcdClient } from '../../shared/services/lcd-client.service';
import { SimulateResponse } from './dtos/simulate-response';
import { WalletSimulate } from './wallet.simulate';
import { IndexerClient } from '../../shared/services/indexer.service';
import { SafeSimulate } from './safe.simulate';

@Injectable()
export class SimulateService {
  private mnemonic: string;

  private chainWalletMap = new Map<string, WalletSimulate>();

  private currentWallet: WalletSimulate;

  constructor(
    private readonly configService: ConfigService,
    private readonly lcdClient: LcdClient,
    private readonly indexerClient: IndexerClient,
  ) {
    this.mnemonic = this.configService.get<string>('SYS_MNEMONIC');
  }

  async simulateWithChain(chain: Chain): Promise<void> {
    let wallet = this.chainWalletMap.get(chain.chainId);
    if (!wallet) {
      wallet = new WalletSimulate(this.mnemonic, chain);
      await wallet.initialize();
      await this.generateSimulateSafe();

      this.chainWalletMap.set(chain.chainId, wallet);
    }
    this.currentWallet = wallet;
  }

  async generateSimulateSafe() {
    // create safe with owner from 1 -> 20
    const {chain} = this.currentWallet;
    const {ownerWallets} = this.currentWallet;

    for (let i = 1; i <= 20; i += 1) {
      const safe = new SafeSimulate();
      safe.setOwners(ownerWallets.slice(0, i), i, chain);

      // get account number and sequence
      const { accountNumber, sequence } =
        await this.indexerClient.getAccountNumberAndSequence(
          chain.chainId,
          safe.address,
        );

      safe.setAccountInfo(accountNumber, sequence);

      // save to map
      this.currentWallet.setSafeOwnerMap(i, safe);
    }
  }

  getCurrentWallet(): WalletSimulate {
    return this.currentWallet;
  }

  async simulate(messages: any[], safeInfo: Safe): Promise<SimulateResponse> {
    // Get sequence of safe account
    const {sequence} = await this.indexerClient.getAccountNumberAndSequence(
        this.currentWallet.chain.chainId,
        safeInfo.safeAddress,
      );

    const encodedBodyBytes = await this.currentWallet.buildEncodedTxBytes(
      messages,
      safeInfo,
      sequence,
    );
    // call simulate api
    const result = await this.lcdClient.simulate(encodedBodyBytes);
    return result;
  }
}
