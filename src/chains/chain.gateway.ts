import { StdSignDoc } from '@cosmjs/amino';
import { fromBase64 } from '@cosmjs/encoding';
import { EthermintHelper } from './ethermint/ethermint.helper';
import { CosmosUtil } from './cosmos/cosmos';
import { Chain } from '../modules/chain/entities/chain.entity';
import { UserInfoDto } from '../modules/auth/dto';

export class ChainGateway {
  private readonly ethermintHelper: EthermintHelper;

  private readonly cosmosUtil: CosmosUtil;

  constructor(public chain: Chain) {
    this.ethermintHelper = new EthermintHelper();
    this.cosmosUtil = new CosmosUtil();
  }

  verifySignature(
    signature: string,
    signDoc: StdSignDoc,
    creator: UserInfoDto,
  ): boolean | Promise<boolean> {
    return this.chain.coinDecimals === 18
      ? this.ethermintHelper.verifySignature(
          signature,
          signDoc,
          creator.address,
          this.chain.prefix,
        )
      : this.cosmosUtil.verifyCosmosSig(
          signature,
          signDoc,
          fromBase64(creator.pubkey),
        );
  }

  pubkeyToAddress(pubkey: string): string {
    return this.chain.coinDecimals === 18
      ? this.ethermintHelper.pubkeyToCosmosAddress(pubkey, this.chain.prefix)
      : this.cosmosUtil.pubkeyToAddress(pubkey, this.chain.prefix);
  }
}
