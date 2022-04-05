import { GasPrice, coins, makeMultisignedTx, StargateClient } from "@cosmjs/stargate";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ErrorMap } from "src/common/error.map";
import { ResponseDto } from "src/dtos/responses";
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from "src/module.config";
import { IGeneralRepository, IMultisigConfirmRepository, IMultisigTransactionsRepository, IMultisigWalletRepository } from "src/repositories";
import { ISmartContractService } from "../ismart-contract.service";
import { BaseService } from "./base.service";
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { fromBase64 } from '@cosmjs/encoding';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { CustomError } from "src/common/customError";
import { ISmartContractRepository } from "src/repositories/ismart-contract.repository";

@Injectable()
export class SmartContractService extends BaseService implements ISmartContractService {
    private readonly _logger = new Logger(SmartContractService.name);

    constructor(
        @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY) private chainRepos: IGeneralRepository,
        @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY) private multisigConfirmRepos: IMultisigConfirmRepository,
        @Inject(REPOSITORY_INTERFACE.ISMART_CONTRACT_REPOSITORY)
        private repos: ISmartContractRepository,
        @Inject(REPOSITORY_INTERFACE.IMULTISIG_TRANSACTION_REPOSITORY)
        private multisigTransactionRepos: IMultisigTransactionsRepository,
        @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
        private safeRepos: IMultisigWalletRepository,
    ) {
        super(repos);
        this._logger.log(
            '============== Constructor Smart Contract Service ==============',
        );
    }

    async queryMessage(request: MODULE_REQUEST.QueryMessageRequest): Promise<ResponseDto> {
        const res = new ResponseDto();
        try {
            let chain = await this.chainRepos.findOne({ where: { id: request.internalChainId } });
            if (!chain) return res.return(ErrorMap.CHAIN_ID_NOT_EXIST);

            const client = await SigningCosmWasmClient.connect(chain.rpc);
            let contractOnchain = await client.getContract(request.contractAddress);
            console.log('Contract onchain: ', contractOnchain);

            var queryMsg = {};
            queryMsg[request.functionName] = request.param;
            let resultQuery = await client.queryContractSmart(request.contractAddress, queryMsg);
            console.log('Query result: ', resultQuery);

            return res.return(ErrorMap.SUCCESSFUL, resultQuery);
        } catch (error) {
            return ResponseDto.responseError(SmartContractService.name, error);
        }
    }

    async createExecuteMessage(request: MODULE_REQUEST.ExecuteMessageRequest): Promise<ResponseDto> {
        const res = new ResponseDto();
        try {
            // Validate safe
            let signResult = await this.signingInstruction(request.internalChainId, request.senderAddress);

            // Validate execute transaction creator
            await this.multisigConfirmRepos.validateOwner(request.creatorAddress, request.senderAddress, request.internalChainId);

            //Validate safe don't have tx pending
            await this.multisigTransactionRepos.validateCreateTx(request.senderAddress);
            await this.repos.validateCreateTx(request.senderAddress);

            let safe = await this.safeRepos.findOne({where: { safeAddress: request.senderAddress }});
        } catch (error) {
            return ResponseDto.responseError(SmartContractService.name, error);
        }
    }

    async signingInstruction(internalChainId: number, sendAddress: string): Promise<any> {

        const chain = await this.chainRepos.findChain(internalChainId);
        const client = await StargateClient.connect(chain.rpc);

        //Check account
        const accountOnChain = await client.getAccount(sendAddress);
        if (!accountOnChain) {
            throw new CustomError(ErrorMap.E001);
        }

        return {
            accountNumber: accountOnChain.accountNumber,
            sequence: accountOnChain.sequence,
            chainId: chain.chainId,
        };
    }

    async testCreateExecuteContract(request: MODULE_REQUEST.ExecuteMessageRequest) {
        const res = new ResponseDto();
        try {
            let chain = await this.chainRepos.findOne({ where: { id: request.internalChainId } });
            if (!chain) return res.return(ErrorMap.CHAIN_ID_NOT_EXIST);

            const client = await StargateClient.connect(chain.rpc);

            let signatures1 = 'Os33lVCI24L+wHeePbpY8YshOEF1PY2rATkhVTUTmT5o+HoKzTVbNLUs2HTX5FPuBRbtxgd01rS/2/dPgZXiCQ=='
            let encodeSignature1 = fromBase64(signatures1)
            // let signatures2 = 'Bg7boP9N3ioQEFr6cu0Fq4Yq1IQqsSOUfSSSN0zFc056qYJ76w3mulnqoKLz4zdN9DkJB3m8vVAAyUpi82HXDw=='
            // let encodeSignature2 = fromBase64(signatures2)
            let addressSignarureMap = new Map<string, Uint8Array>();
            addressSignarureMap.set('aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa', encodeSignature1);
            // addressSignarureMap.set('aura136v0nmlv0saryev8wqz89w80edzdu3quzm0ve9', encodeSignature2)
            const sendFee = {
                amount: coins(140, 'uaura'),
                gas: '140000',
            };
            let encodedBodyBytes = fromBase64('CtoBCiQvY29zbXdhc20ud2FzbS52MS5Nc2dFeGVjdXRlQ29udHJhY3QSsQEKK2F1cmExdG04eWZzN25meTlrN243bXo3eTZxcW5keThwcjB0dTRqNDh1eTMSP2F1cmExNGhqMnRhdnE4ZnBlc2R3eHhjdTQ0cnR5M2hoOTB2aHVqcnZjbXN0bDR6cjN0eG1mdnc5c3dzZXJrdxpBeyJhZGRfbmV3Ijp7ImlkIjoiZjEwIiwibmFtZSI6InZpb2xldCIsImFtb3VudCI6MTUwLCJwcmljZSI6MTAwfX0SEUludGVyYWN0IGNvbnRyYWN0')
            const safePubkey = JSON.parse('{"type":"tendermint/PubKeyMultisigThreshold","value":{"threshold":"1","pubkeys":[{"type":"tendermint/PubKeySecp256k1","value":"A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"}]}}')
            let executeTransaction = makeMultisignedTx(
                safePubkey,
                3,
                sendFee,
                encodedBodyBytes,
                addressSignarureMap
            )
            console.log(executeTransaction)
            let encodeTransaction = Uint8Array.from(TxRaw.encode(executeTransaction).finish())
            const result = await client.broadcastTx(encodeTransaction)
            console.log(result)
            return res.return(ErrorMap.SUCCESSFUL, result)
        } catch (error) {
            return ResponseDto.responseError(SmartContractService.name, error);
        }
    }
}