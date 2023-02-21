import {
  encodeSecp256k1Pubkey,
  pubkeyToAddress,
  Secp256k1HdWallet,
  Secp256k1Pubkey,
  StdFee,
} from '@cosmjs/amino';
import { EncodeObject, AccountData } from '@cosmjs/proto-signing';
import { SignerData, SigningStargateClient } from '@cosmjs/stargate';
import { OwnerSimulateSignResponse } from './dtos/ower-simulate-sig-response';

export class OwnerSimulate {
  address: string;

  pubkey: Secp256k1Pubkey;

  constructor(
    public wallet: Secp256k1HdWallet,
    public account: AccountData,
    public prefix: string,
  ) {
    this.pubkey = encodeSecp256k1Pubkey(account.pubkey);
    this.address = pubkeyToAddress(this.pubkey, this.prefix);
  }

  /**
   *
   * @param msgs
   * @param fee
   * @param accountNumber
   * @param sequence
   * @param chainId
   * @returns
   */
  async sign(
    msgs: EncodeObject[],
    fee: StdFee,
    accountNumber: number,
    sequence: number,
    chainId: string,
  ): Promise<OwnerSimulateSignResponse> {
    const signingClient = await SigningStargateClient.offline(this.wallet);
    const signerData: SignerData = {
      accountNumber,
      sequence,
      chainId,
    };

    const { bodyBytes, signatures } = await signingClient.sign(
      this.address,
      msgs,
      fee,
      '',
      signerData,
    );

    const result: OwnerSimulateSignResponse = {
      address: this.address,
      bodyBytes,
      signature: signatures[0],
    };

    return result;
  }
}
