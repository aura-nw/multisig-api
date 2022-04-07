import {
  createMultisigThresholdPubkey,
  Pubkey,
  pubkeyToAddress,
  SinglePubkey,
} from '@cosmjs/amino';
import { Fee, LCDClient, LegacyAminoMultisigPublicKey, MsgSend, MultiSignature, SignatureV2, SimplePublicKey } from '@terra-money/terra.js';
import { PUBKEY_TYPES } from 'src/common/constants/app.constant';
import { MultisigTransaction, Safe } from 'src/entities';
import { ConfigService } from '../shared/services/config.service';

export class CommonUtil {
  private configService: ConfigService = new ConfigService();
  constructor() {}

  /**
   * Calculate address from public key
   * @param pubkey public key
   * @returns address string
   */
  public pubkeyToAddress(
    pubkey: Pubkey,
    prefix = this.configService.get('PREFIX'),
  ): string {
    return pubkeyToAddress(pubkey, prefix);
  }

  /**
   * https://stackoverflow.com/a/34890276
   * @param xs
   * @param key
   * @returns
   */
  public groupBy<TItem>(xs: TItem[], key: string): { [key: string]: TItem[] } {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  /**
   * https://stackoverflow.com/a/54974076/8461456
   * @param arr
   * @returns boolean
   */
  public checkIfDuplicateExists(arr): boolean {
    return new Set(arr).size !== arr.length;
  }

  /**
   *
   * @param strArr
   * @returns string[]
   */
  public filterEmptyInStringArray(strArr: string[]): string[] {
    return strArr.filter((e) => {
      return e !== '';
    });
  }

  createSafeAddressAndPubkey(
    pubKeyArrString: string[],
    threshold: number,
    prefix: string,
  ): {
    pubkey: string;
    address: string;
  } {
    const arrPubkeys = pubKeyArrString.map(this.createPubkeys);
    const multisigPubkey = createMultisigThresholdPubkey(arrPubkeys, threshold);
    const multiSigWalletAddress = this.pubkeyToAddress(multisigPubkey, prefix);
    return {
      pubkey: JSON.stringify(multisigPubkey),
      address: multiSigWalletAddress,
    };
  }

  private createPubkeys(value: string): SinglePubkey {
    const result: SinglePubkey = {
      type: PUBKEY_TYPES.SECP256K1,
      value,
    };
    return result;
  }

  async makeTerraTx(multisigTransaction: MultisigTransaction, safe: Safe, multisigConfirmArr: any[], client: LCDClient) {
    const multisigPubkey = LegacyAminoMultisigPublicKey.fromAmino(JSON.parse(safe.safePubkey))
    const multisig = new MultiSignature(multisigPubkey)

    const amount = {};
    amount[multisigTransaction.denom] = multisigTransaction.amount;
    const send = new MsgSend(
      multisigTransaction.fromAddress,
      multisigTransaction.toAddress,
      amount
    );

    const tx = await client.tx.create(
      [
        {
          address: multisigTransaction.fromAddress,
          sequenceNumber: Number(multisigTransaction.sequence),
          publicKey: multisigPubkey
        },
      ],
      {
        msgs: [send],
        fee: new Fee(multisigTransaction.gas, multisigTransaction.fee + multisigTransaction.denom),
        gas: multisigTransaction.gas.toString()
      }
    );

    let addressSignarureMap = [];
    multisigConfirmArr.forEach((x) => {
      const pubkeyAmino: SimplePublicKey.Amino = {
        type: PUBKEY_TYPES.SECP256K1,
        value: x.pubkey
      };
      const amino: SignatureV2.Amino = {
        signature: x.signature,
        pub_key: pubkeyAmino
      };
      const sig = SignatureV2.fromAmino(amino);
      addressSignarureMap.push(sig);
    });

    multisig.appendSignatureV2s(addressSignarureMap);
    tx.appendSignatures([
      new SignatureV2(
        multisigPubkey,
        multisig.toSignatureDescriptor(),
        Number(multisigTransaction.sequence)
      ),
    ]);

    return tx;
  }
}
