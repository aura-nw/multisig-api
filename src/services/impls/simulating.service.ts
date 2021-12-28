import { Inject, Injectable, Logger } from "@nestjs/common";
import { ResponseDto } from "src/dtos/responses/response.dto";
import { ErrorMap } from "../../common/error.map";
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from "../../module.config";
import { ISimulatingService } from "../isimulating.service";
import { createMultisigThresholdPubkey, decodeBech32Pubkey, encodeSecp256k1Pubkey, isMultisigThresholdPubkey, isSinglePubkey, MultisigThresholdPubkey, pubkeyToAddress, Secp256k1HdWallet, Secp256k1Pubkey, SinglePubkey } from '@cosmjs/amino';
import { makeMultisignedTx, MsgSendEncodeObject, SignerData, SigningStargateClient, StargateClient } from '@cosmjs/stargate';

import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { coins } from "@cosmjs/proto-signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Cache } from 'cache-manager';
import { Bech32, fromHex, toBase64 } from "@cosmjs/encoding";
import { assert } from "@cosmjs/utils";
import { ConfigService } from "src/shared/services/config.service";
@Injectable()
export class SimulatingService implements ISimulatingService {
    private readonly _logger = new Logger(SimulatingService.name);
    constructor(
        private configService: ConfigService,
    ){
        this._logger.log("============== Constructor Simulating Service ==============");
        this._prefix = this.configService.get("PREFIX");
    }
    _prefix: string;

    async simulating(request: MODULE_REQUEST.SimulatingMultisigRequest): Promise<ResponseDto> {
        // const multisigAccountAddress = "aura139v4nxwg3gsldnulzjfkl2nz8yr8rg6r4rx3ep";
		const signingInstruction = await (async () => {
			const client = await StargateClient.connect(this.configService.get("TENDERMINT_URL"));
			const accountOnChain = await client.getAccount(request.fromAddress);
			assert(accountOnChain, "Account does not exist on chain");

			const msgSend: MsgSend = {
				fromAddress: request.fromAddress,
				toAddress: request.toAddress,
				amount: coins(1, "stake"),
			};
			const msg: MsgSendEncodeObject = {
				typeUrl: "/cosmos.bank.v1beta1.MsgSend",
				value: msgSend,
			};
			const gasLimit = 200000;
			const fee = {
				amount: coins(1, "stake"),
				gas: gasLimit.toString(),
			};

			return {
				accountNumber: accountOnChain.accountNumber,
				sequence: accountOnChain.sequence,
				chainId: await client.getChainId(),
				msgs: [msg],
				fee: fee,
				memo: "Use your tokens wisely",
			};
		})();
		const [pubkey0, signature0, bodyBytes] = await this.simulateSign(signingInstruction, request.mnemonics[0]);
		const [pubkey1, signature1] = await this.simulateSign(signingInstruction, request.mnemonics[1]);

		{
			const multisigPubkey = createMultisigThresholdPubkey(
				[pubkey0, pubkey1],
				2,
			);
			this._logger.log(pubkeyToAddress(multisigPubkey, this._prefix));
			this._logger.log(request.fromAddress);

			const address0 = pubkeyToAddress(pubkey0, this._prefix);
			const address1 = pubkeyToAddress(pubkey1, this._prefix);

			const broadcaster = await StargateClient.connect(this.configService.get("TENDERMINT_URL"));
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
			this._logger.log("signedTx", signedTx);
			// ensure signature is valid
			const result = await broadcaster.broadcastTx(Uint8Array.from(TxRaw.encode(signedTx).finish()));
			this._logger.log("result", result);
            const res = new ResponseDto;
            return res.return(ErrorMap.SUCCESSFUL.Code, result);
		}
    }

    async simulateSign(signingInstruction, mnemonic) : Promise<[Secp256k1Pubkey, Uint8Array, Uint8Array]> {
		const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix: this._prefix });
		const pubkey = encodeSecp256k1Pubkey((await wallet.getAccounts())[0].pubkey);
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

}