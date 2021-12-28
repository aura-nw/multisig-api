import { Inject, Injectable, Logger } from "@nestjs/common";
import { ResponseDto } from "src/dtos/responses/response.dto";
import { ErrorMap } from "../../common/error.map";
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from "../../module.config";
import { ConfigService } from "src/shared/services/config.service";
import { IMultisigWalletService } from "../imultisig-wallet.service";
import { createMultisigThresholdPubkey, pubkeyToAddress, SinglePubkey } from "@cosmjs/amino";
@Injectable()
export class MultisigWalletService implements IMultisigWalletService {
    private readonly _logger = new Logger(MultisigWalletService.name);
    constructor(
        private configService: ConfigService,
    ){
        this._logger.log("============== Constructor Multisig Wallet Service ==============");
    }
	async createMultisigWallet(request: MODULE_REQUEST.CreateMultisigWalletRequest): Promise<ResponseDto> {
        let { pubkeys, name } = request;
        let arrPubkeys = pubkeys.map(this.createPubkeys);
		const multisigPubkey = createMultisigThresholdPubkey(
			arrPubkeys,
			request.threshold,
		);
		let result = {
			pubkey: JSON.stringify(multisigPubkey),
			address: pubkeyToAddress(multisigPubkey, 'aura'),
		}
        const res = new ResponseDto();
		return res.return(ErrorMap.SUCCESSFUL.Code, result);
	}
    
    createPubkeys(value1: string): SinglePubkey {
		let result: SinglePubkey = {
			type: 'tendermint/PubKeySecp256k1',
			value: value1
		}
		return result
	}
}