import { createMultisigThresholdPubkey, decodeBech32Pubkey, encodeSecp256k1Pubkey, isMultisigThresholdPubkey, isSinglePubkey, MultisigThresholdPubkey, pubkeyToAddress, Secp256k1HdWallet, Secp256k1Pubkey, SinglePubkey } from '@cosmjs/amino';
import { makeMultisignedTx, MsgSendEncodeObject, SignerData, SigningStargateClient, StargateClient } from '@cosmjs/stargate';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { CreateMultisigRequest } from '../dtos/requests/createMultisig.request';
import { SingleSignRequest } from '../dtos/requests//singleSign.request';
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { coins } from "@cosmjs/proto-signing";
import { BroadcastRequest } from '../dtos/requests/broadcast.request';
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { CreateTransactionRequest } from '../dtos/requests//createTransaction.request';
import { Cache } from 'cache-manager';
import { Bech32, fromHex, toBase64 } from "@cosmjs/encoding";
import { assert } from "@cosmjs/utils";
@Injectable()
export class AppService {


	tendermintUrl: string = 'http://localhost:26657';
	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache
	) {
		console.log("============== Constructor AppService ==============");

	}


	async createMultisigWallet(req: CreateMultisigRequest) {
		let { pubkeys, name } = req;
		// let account1 = {
		// 	mnemonic: 'mirror shield about chef divert initial vast prosper wrist quit lab unique daughter device prepare gauge potato unit biology member section tunnel desert warm'
		// }
		// const wallet = await Secp256k1HdWallet.fromMnemonic(account1.mnemonic, {
		// 	prefix: 'aura',
		// });

		// const pubkey = encodeSecp256k1Pubkey((await wallet.getAccounts())[0].pubkey);
		// console.log(pubkey);
		// console.log(this.createPubkeys(pubkeys[0]));
		// const address = (await wallet.getAccounts())[0].address;


		// console.log(isSinglePubkey(this.createPubkeys(pubkeys[0])))

		// console.log(decodeBech32Pubkey("wasmpub1addwnpepqwxttx8w2sfs6d8cuzqcuau84grp8xsw95qzdjkmvc44tnckskdxw3zw2km"));
		const multisigPubkey = createMultisigThresholdPubkey(
			[this.createPubkeys(pubkeys[0]), this.createPubkeys(pubkeys[1])],
			2,
		);
		let result = {
			pubkey: JSON.stringify(multisigPubkey),
			address: pubkeyToAddress(multisigPubkey, 'aura'),
		}
		await this.cacheManager.set('resultCreateMultisig', result, { ttl: 10000 });
		return result;
	}

	async createTransaction(req: CreateTransactionRequest) {
		const signingInstruction = await (async () => {
			const client = await StargateClient.connect(this.tendermintUrl);
			const accountOnChain = await client.getAccount(req.from);

			const msgSend: MsgSend = {
				fromAddress: req.from,
				toAddress: req.to,
				amount: coins(req.amount, 'uatom'),
			};
			const msg: MsgSendEncodeObject = {
				typeUrl: "/cosmos.bank.v1beta1.MsgSend",
				value: msgSend,
			};
			const gasLimit = req.gasLimit;
			const fee = {
				amount: coins(req.fee, 'uatom'),
				gas: req.gasLimit,
			};
			let result = {
				accountNumber: accountOnChain ? accountOnChain.accountNumber : 0,
				sequence: accountOnChain ? accountOnChain.sequence : 0,
				chainId: await client.getChainId(),
				msgs: [msg],
				fee: fee,
				memo: "Use your tokens wisely",
			};


			return result;
		})();

		await this.cacheManager.set('resultCreateTransaction', signingInstruction, { ttl: 10000 });
		return signingInstruction;
	}

	async singleSign(req: SingleSignRequest) {

		const wallet = await Secp256k1HdWallet.fromMnemonic(req.mnemonic, {
			prefix: 'aura',
		});
		const pubkey = encodeSecp256k1Pubkey((await wallet.getAccounts())[0].pubkey);
		const address = (await wallet.getAccounts())[0].address;
		const signingClient = await SigningStargateClient.offline(wallet);
		const signingInstruction = await this.cacheManager.get('resultCreateTransaction'); +
			console.log(signingInstruction);
		const signerData: SignerData = {
			accountNumber: signingInstruction['accountNumber'],
			sequence: signingInstruction['sequence'],
			chainId: signingInstruction['chainId'],
		};
		const { bodyBytes: bb, signatures } = await signingClient.sign(
			address,
			signingInstruction['msgs'],
			signingInstruction['fee'],
			signingInstruction['memo'],
			signerData,
		);
		let result = {
			bodyBytes: bb,
			signature: signatures
		}
		await this.cacheManager.set(`resultSign${address}`, result, { ttl: 10000 });
		return result
	}


	async broadcast(req: BroadcastRequest) {
		const broadcaster = await StargateClient.connect(this.tendermintUrl);
		let signingInstruction = await this.cacheManager.get('resultCreateTransaction');

		let multisigPubkey: MultisigThresholdPubkey = await this.cacheManager.get('resultCreateMultisig');
		console.log(multisigPubkey);
		const address1 = pubkeyToAddress(this.createPubkeys(req.pubkeys[0]), 'aura');
		const address2 = pubkeyToAddress(this.createPubkeys(req.pubkeys[1]), 'aura');
		const gasLimit = 200000;
		const fee = {
			amount: coins(0, "stake"),
			gas: gasLimit.toString(),
		};

		let resultSig1 = await this.cacheManager.get(`resultSign${address1}`);
		let resultSig2 = await this.cacheManager.get(`resultSign${address2}`);

		// let bodyBytes = new Uint8Array(this.signature1.bodyBytes.data);
		// let sig1 = new Uint8Array(this.signature1.signature[0]);
		// let sig2 = new Uint8Array(this.signature2.signature[0]);
		let bodyBytes = resultSig1['bodyBytes'];
		let sig1 = resultSig1['signature'];
		let sig2 = resultSig2['signature'];

		const signedTx = makeMultisignedTx(
			JSON.parse(multisigPubkey['pubkey']),
			signingInstruction['sequence'],
			fee,
			bodyBytes,
			new Map<string, Uint8Array>([
				[address1, sig1],
				[address2, sig2],
			]),
		);
		console.log(signedTx);
		const result = await broadcaster.broadcastTx(Uint8Array.from(TxRaw.encode(signedTx).finish()));

		return result;

	}


	async simulateMultisigTransaction() {

		const multisigAccountAddress = "aura139v4nxwg3gsldnulzjfkl2nz8yr8rg6r4rx3ep";
		const signingInstruction = await (async () => {
			const client = await StargateClient.connect(this.tendermintUrl);
			const accountOnChain = await client.getAccount(multisigAccountAddress);
			assert(accountOnChain, "Account does not exist on chain");

			const msgSend: MsgSend = {
				fromAddress: multisigAccountAddress,
				toAddress: "aura17gq3qq3peflvv3tg5slcp4j4p8r655j7dn8ghm",
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
		const [pubkey0, signature0, bodyBytes] = await this.simulateSign(signingInstruction, "parrot theory because trouble nuclear right half people process pride cement primary mail tiny tongue vendor rail match symptom upgrade random uncle pudding birth")
		const [pubkey1, signature1] = await this.simulateSign(signingInstruction, "phone sugar eager carbon birth plate beach front mask chaos luggage recycle kitchen indicate light future bird parrot soap master disagree tell skill secret")

		{
			const multisigPubkey = createMultisigThresholdPubkey(
				[pubkey0, pubkey1],
				2,
			);
			console.log(pubkeyToAddress(multisigPubkey, 'aura'));
			console.log(multisigAccountAddress);

			const address0 = pubkeyToAddress(pubkey0, "aura");
			const address1 = pubkeyToAddress(pubkey1, "aura");

			const broadcaster = await StargateClient.connect(this.tendermintUrl);
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
			console.log("signedTx", signedTx);
			// ensure signature is valid
			const result = await broadcaster.broadcastTx(Uint8Array.from(TxRaw.encode(signedTx).finish()));
			console.log("result", result);

		}
	}

	async simulateSign(signingInstruction, mnemonic) : Promise<[Secp256k1Pubkey, Uint8Array, Uint8Array]> {
		const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'aura' });
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

	getHello(): string {
		return 'Hello World!';
	}

	createPubkeys(value1: string): SinglePubkey {
		let result: SinglePubkey = {
			type: 'tendermint/PubKeySecp256k1',
			value: value1
		}
		return result
	}
}
