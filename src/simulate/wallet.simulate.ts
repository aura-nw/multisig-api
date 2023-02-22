import { makeCosmoshubPath, Secp256k1HdWallet } from '@cosmjs/amino';
import { fromBase64, toBase64 } from '@cosmjs/encoding';
import { SafeSimulate } from './safe.simulate';
import { OwnerSimulate } from './owner.simulate';
import { SimulateUtils } from './utils';
import { Chain } from '../modules/chain/entities/chain.entity';
import { Safe } from '../modules/safe/entities/safe.entity';

export class WalletSimulate {
  safeOwnerMap = new Map<number, SafeSimulate>();

  ownerWallets: OwnerSimulate[] = [];

  constructor(public mnemonic: string, public chain: Chain) {}

  /**
   * init system safes for simulate tx
   */
  async initialize(): Promise<void> {
    // generate owners
    const promises = [];
    for (let i = 0; i < 20; i += 1) {
      // create wallet
      promises.push(
        Secp256k1HdWallet.fromMnemonic(this.mnemonic, {
          hdPaths: [makeCosmoshubPath(i)],
          prefix: this.chain.prefix,
        }),
      );
    }
    const wallets = await Promise.all(promises);

    // create account
    const accounts = await Promise.all(
      wallets.map((wallet) => wallet.getAccounts()),
    );

    for (let i = 0; i < 20; i += 1) {
      // create owner
      const ownerWallet = new OwnerSimulate(
        wallets[i],
        accounts[i][0],
        this.chain.prefix,
      );
      this.ownerWallets.push(ownerWallet);
    }

    // create safe with owner from 1 -> 20
    for (let i = 1; i <= 20; i += 1) {
      const safe = new SafeSimulate(
        this.ownerWallets.slice(0, i),
        i,
        this.chain,
      );

      // save to map
      this.safeOwnerMap.set(i, safe);
    }
  }

  /**
   *
   * @param messages
   * @param totalOwner
   */
  async buildEncodedTxBytes(messages: any[], safeInfo: Safe): Promise<string> {
    const safePubkey = JSON.parse(safeInfo.safePubkey);
    const totalOwner = safePubkey.value.pubkeys.length;

    // get safe from map
    const safeSimulate = this.safeOwnerMap.get(totalOwner);
    if (!safeSimulate) {
      throw new Error('safe not found');
    }

    // initialize system safe to generate auth info, signature
    await safeSimulate.initialize();

    // build bodyByte & authInfoBytes
    const { bodyBytes, authInfoBytes } =
      await safeSimulate.makeSimulateBodyBytesAndAuthInfo(
        messages,
        safeInfo.safeAddress,
        safePubkey,
        this.chain.prefix,
      );

    // build txBytes
    const txBytes = SimulateUtils.makeTxBytes(
      bodyBytes,
      authInfoBytes,
      fromBase64(safeSimulate.signature),
    );
    return toBase64(txBytes);
  }

  /**
   * getAddresses
   * @returns
   */
  getAddresses(): string[] {
    return [...this.safeOwnerMap.values()].map((safe) => safe.address);
  }

  /**
   * getAllOwnerAddresses
   * @returns
   */
  getAllOwnerAddresses(): string[] {
    return this.ownerWallets.map((owner) => owner.address);
  }
}
