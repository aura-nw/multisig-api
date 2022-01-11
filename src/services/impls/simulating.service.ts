import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { ISimulatingService } from '../isimulating.service';
import {
  createMultisigThresholdPubkey,
  decodeBech32Pubkey,
  encodeSecp256k1Pubkey,
  isMultisigThresholdPubkey,
  isSinglePubkey,
  MultisigThresholdPubkey,
  pubkeyToAddress,
  Secp256k1HdWallet,
  Secp256k1Pubkey,
  SinglePubkey,
  StdSignDoc,
  serializeSignDoc,
} from '@cosmjs/amino';
import {
  makeMultisignedTx,
  MsgSendEncodeObject,
  SignerData,
  SigningStargateClient,
  StargateClient,
} from '@cosmjs/stargate';

import { Secp256k1, Secp256k1Signature, sha256 } from '@cosmjs/crypto';

import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { coins } from '@cosmjs/proto-signing';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Cache } from 'cache-manager';
import { fromBase64, toUtf8 } from '@cosmjs/encoding';
import { assert } from '@cosmjs/utils';
import { ConfigService } from 'src/shared/services/config.service';
@Injectable()
export class SimulatingService implements ISimulatingService {
  private readonly _logger = new Logger(SimulatingService.name);
  constructor(private configService: ConfigService) {
    this._logger.log(
      '============== Constructor Simulating Service ==============',
    );
    this._prefix = this.configService.get('PREFIX');
  }
  _prefix: string;

  async simulating(
    request: MODULE_REQUEST.SimulatingMultisigRequest,
  ): Promise<ResponseDto> {
    // const multisigAccountAddress = "aura139v4nxwg3gsldnulzjfkl2nz8yr8rg6r4rx3ep";
    const signingInstruction = await (async () => {
      const client = await StargateClient.connect(
        this.configService.get('TENDERMINT_URL'),
      );
      const accountOnChain = await client.getAccount(request.fromAddress);
      assert(accountOnChain, 'Account does not exist on chain');

      const msgSend: MsgSend = {
        fromAddress: request.fromAddress,
        toAddress: request.toAddress,
        amount: coins(1, 'stake'),
      };
      const msg: MsgSendEncodeObject = {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: msgSend,
      };
      const gasLimit = 100000;
      const fee = {
        amount: coins(1, 'stake'),
        gas: gasLimit.toString(),
      };

      return {
        accountNumber: accountOnChain.accountNumber,
        sequence: accountOnChain.sequence,
        chainId: await client.getChainId(),
        msgs: [msg],
        fee: fee,
        memo: 'Use your tokens wisely',
      };
    })();
    console.log(signingInstruction);
    const [pubkey0, signature0, bodyBytes] = await this.simulateSign(
      signingInstruction,
      request.mnemonics[0],
    );
    console.log(pubkey0, signature0, bodyBytes);
    const [pubkey1, signature1] = await this.simulateSign(
      signingInstruction,
      request.mnemonics[1],
    );

    {
      const multisigPubkey = createMultisigThresholdPubkey(
        [pubkey0, pubkey1],
        2,
      );
      this._logger.log(pubkeyToAddress(multisigPubkey, this._prefix));
      this._logger.log(request.fromAddress);

      const address0 = pubkeyToAddress(pubkey0, this._prefix);
      const address1 = pubkeyToAddress(pubkey1, this._prefix);

      console.log(address0);
      console.log(address1);

      const broadcaster = await StargateClient.connect(
        this.configService.get('TENDERMINT_URL'),
      );
      const signedTx = makeMultisignedTx(
        multisigPubkey,
        signingInstruction.sequence,
        signingInstruction.fee,
        bodyBytes,
        new Map<string, Uint8Array>([
          [address0, signature0],
          [address1, signature1],
        ]),
      );
      //   this._logger.log('signedTx', signedTx);
      // ensure signature is valid
      const result = await broadcaster.broadcastTx(
        Uint8Array.from(TxRaw.encode(signedTx).finish()),
      );
      this._logger.log('result', JSON.stringify(result));
      const res = new ResponseDto();
      return res.return(ErrorMap.SUCCESSFUL, result);
    }
  }

  async simulateSign(
    signingInstruction,
    mnemonic,
  ): Promise<[Secp256k1Pubkey, Uint8Array, Uint8Array]> {
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: this._prefix,
    });
    const pubkey = encodeSecp256k1Pubkey(
      (await wallet.getAccounts())[0].pubkey,
    );
    const address = (await wallet.getAccounts())[0].address;
    const signingClient = await SigningStargateClient.offline(wallet);
    const signerData: SignerData = {
      accountNumber: signingInstruction.accountNumber,
      sequence: signingInstruction.sequence,
      chainId: signingInstruction.chainId,
    };
    const { bodyBytes: bb, signatures } = await signingClient.sign(
      address,
      signingInstruction.msgs,
      signingInstruction.fee,
      signingInstruction.memo,
      signerData,
    );
    return [pubkey, signatures[0], bb];
  }

  async simulateSignDeleteSafe(
    request: MODULE_REQUEST.SimulatingSignMsgRequest,
  ) {
    const res = new ResponseDto();
    const { mnemonic, safeId } = request;

    const actionMsg = JSON.stringify({
      delete: true,
      safeId,
    });

    const client = await StargateClient.connect(
      this.configService.get('TENDERMINT_URL'),
    );

    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: this._prefix,
    });

    const { address, pubkey } = (await wallet.getAccounts())[0];

    const accountOnChain = await client.getAccount(address);
    assert(accountOnChain, 'Account does not exist on chain');

    const signDoc = {
      msgs: [],
      fee: { amount: [], gas: '0' },
      chain_id: await client.getChainId(),
      memo: actionMsg,
      account_number: accountOnChain.accountNumber.toString(),
      sequence: accountOnChain.sequence.toString(),
    };

    const result: { signed; signature } = await wallet.signAmino(
      address,
      signDoc,
    );
    // console.log('signed: ', result.signed);
    // console.log('signature: ', result.signature);

    const msg = sha256(serializeSignDoc(result.signed));
    console.log('msg: ', msg);

    const valid = await Secp256k1.verifySignature(
      Secp256k1Signature.fromFixedLength(
        fromBase64(result.signature.signature),
      ),
      msg,
      pubkey,
    );

    return res.return(ErrorMap.SUCCESSFUL, { ...result, valid });
  }
}
