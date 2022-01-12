import { IBaseRepository } from "./ibase.repository";

export interface ITransactionRepository extends IBaseRepository {
    /**
     * Get all Transactions from AuraTx DB
     * @param safeAddress 
     */
    getAuraTx(safeAddress: string): any;
}