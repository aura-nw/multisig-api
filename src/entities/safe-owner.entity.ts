import { BaseEntityAutoId } from "./base/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: 'Safe_Owner' })
export class Owner extends BaseEntityAutoId {
    @Column({name: 'Safe_Id'})
    safeId: string;

    @Column({name: 'Owner_Address'})
    ownerAddress: string;
 
    @Column({name: 'Owner_Pubkey'})
    ownerPubkey: string;
}

