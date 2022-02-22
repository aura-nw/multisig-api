import { IBaseRepository } from "./ibase.repository";

export interface ITransactionRepository extends IBaseRepository {
    /**
     * Get all Transactions from AuraTx DB
     * @param safeAddress 
     */
    getAuraTx(safeAddress: string, pageIndex: number, pageSize: number): any;

    /**
     * Get details of a transaction from AuraTx table
     */
    getTransactionDetailsAuraTx(condition: any): any;
}