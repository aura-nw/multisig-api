import { IBaseRepository } from './ibase.repository';

export interface IMultisigWalletRepository extends IBaseRepository {
    /**
     * get multisig wallet information
     */
    getMultisigWalletInformation(safe_address: string, chainId: string, pubkeys: string);
}
