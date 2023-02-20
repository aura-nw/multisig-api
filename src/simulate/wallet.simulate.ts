import { makeCosmoshubPath, Secp256k1HdWallet } from '@cosmjs/amino';
import { fromBase64, toBase64 } from '@cosmjs/encoding';
import { SafeSimulate } from './safe.simulate';
import { OwnerSimulate } from './owner.simulate';
import { SimulateUtils } from './utils';
import { SimulateResponse } from './dtos/simulate';
import { LcdClient } from '../utils/apis/LcdClient';
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
    for (let i = 0; i < 20; i += 1) {
      // create wallet
      const wallet = await Secp256k1HdWallet.fromMnemonic(this.mnemonic, {
        hdPaths: [makeCosmoshubPath(i)],
        prefix: this.chain.prefix,
      });

      // create account
      const accounts = await wallet.getAccounts();

      // create owner
      const ownerWallet = new OwnerSimulate(
        wallet,
        accounts[0],
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
  async simulate(messages: any[], safeInfo: Safe): Promise<SimulateResponse> {
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

    // call simulate api
    const lcdClient = new LcdClient(this.chain.rest);
    const result = await lcdClient.simulate(toBase64(txBytes));
    return result;
  }

  /**
   * getAddresses
   * @returns
   */
  getAddresses(): string[] {
    return Array.from(this.safeOwnerMap.values()).map((safe) => safe.address);
  }

  /**
   * getAllOwnerAddresses
   * @returns
   */
  getAllOwnerAddresses(): string[] {
    return this.ownerWallets.map((owner) => owner.address);
  }
}
