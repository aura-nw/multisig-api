import { BaseEntityAutoId } from "./base/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: 'Owner' })
export class Owner extends BaseEntityAutoId {
    @Column({name: 'Name'})
    name: string;
 
    @Column({name: 'Pubkey'})
    pubkey: string;
}

