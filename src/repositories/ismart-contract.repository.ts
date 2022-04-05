import { IBaseRepository } from "./ibase.repository";

export interface ISmartContractRepository extends IBaseRepository {
    /**
   * Validate safe don't have pending tx
   */
  validateCreateTx(from: string): Promise<any>;
}