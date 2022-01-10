import { IBaseRepository } from "./ibase.repository";

export interface IGeneralRepository extends IBaseRepository {

    /**
     * Show network list
     */
    showNetworkList(): any;
}