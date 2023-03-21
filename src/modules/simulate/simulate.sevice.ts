import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Chain } from '../chain/entities/chain.entity';
import { Safe } from '../safe/entities/safe.entity';
import { LcdClient } from '../../shared/services/lcd-client.service';
import { SimulateResponse } from './dtos/simulate-response';
import { WalletSimulate } from './wallet.simulate';
import { IndexerClient } from '../../shared/services/indexer.service';
import { SafeSimulate } from './safe.simulate';
import { AccountInfo } from '../../common/dtos/account-info';
import { IMessageUnknown } from '../../interfaces';

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

  /**
   * Initialize wallet and safe for simulate
   * @param chain
   */
  async initialize(chain: Chain): Promise<void> {
    // Get wallet from map
    let wallet = this.chainWalletMap.get(chain.chainId);

    // If wallet is not exist, create new wallet
    if (wallet) {
      this.currentWallet = wallet;
    } else {
      wallet = new WalletSimulate(this.mnemonic, chain);

      // Initialize wallet
      await wallet.initialize();

      // Set current wallet
      this.currentWallet = wallet;

      // Generate simulate safe
      await this.generateSimulateSafe(chain);

      // Save to map
      this.chainWalletMap.set(chain.chainId, wallet);
    }
  }

  /**
   * Simulate tx
   * @param messages
   * @param safeInfo
   * @param lcdUrl
   * @returns
   */
  async simulate(
    messages: IMessageUnknown[],
    safeInfo: Safe,
    lcdUrl: string,
  ): Promise<SimulateResponse> {
    // Get sequence of safe account
    const { sequence } = await this.indexerClient.getAccountNumberAndSequence(
      this.currentWallet.chain.chainId,
      safeInfo.safeAddress,
    );

    // Get encoded tx bytes
    const encodedBodyBytes = await this.currentWallet.buildEncodedTxBytes(
      messages,
      safeInfo,
      sequence,
    );

    // Call simulate api to get gas
    const result = await this.lcdClient.simulate(lcdUrl, encodedBodyBytes);
    return result;
  }

  /**
   * Get current wallet
   * @returns
   */
  getCurrentWallet(): WalletSimulate {
    return this.currentWallet;
  }

  private async generateSimulateSafe(chain: Chain) {
    // create safe with owner from 1 -> 20
    const { ownerWallets } = this.currentWallet;

    const listSafe: SafeSimulate[] = [];
    const promises: Promise<AccountInfo>[] = [];
    for (let i = 1; i <= 20; i += 1) {
      const safe = new SafeSimulate();
      safe.setOwners(ownerWallets.slice(0, i), i, chain);
      listSafe.push(safe);

      promises.push(
        this.indexerClient.getAccountNumberAndSequence(
          chain.chainId,
          safe.address,
        ),
      );
    }

    const result = await Promise.all(promises);
    for (let i = 0; i < 20; i += 1) {
      const { accountNumber, sequence } = result[i];
      listSafe[i].setAccountInfo(accountNumber, sequence);

      // save to map
      this.currentWallet.setSafeOwnerMap(i, listSafe[i]);
    }
  }
}
