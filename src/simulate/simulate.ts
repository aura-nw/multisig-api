import { Chain } from '../entities';
import { WalletSimulate } from './wallet.simulate';

export class Simulate {
  chainWalletMap = new Map<string, WalletSimulate>();
  constructor(public mnemonic: string) {}

  async simulateWithChain(chain: Chain) {
    let wallet = this.chainWalletMap.get(chain.chainId);
    if (!wallet) {
      wallet = new WalletSimulate(this.mnemonic, chain);
      await wallet.initialize();
      this.chainWalletMap.set(chain.chainId, wallet);
    }
    return wallet;
  }
}
