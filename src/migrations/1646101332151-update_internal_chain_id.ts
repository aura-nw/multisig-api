import {MigrationInterface, QueryRunner} from "typeorm";

export class updateInternalChainId1646101332151 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE AuraTx SET InternalChainId = 12 WHERE InternalChainId = 3;
            UPDATE AuraTx SET InternalChainId = 13 WHERE InternalChainId = 4;
            UPDATE AuraTx SET InternalChainId = 14 WHERE InternalChainId = 5;
            UPDATE AuraTx SET InternalChainId = 15 WHERE InternalChainId = 6;
            UPDATE AuraTx SET InternalChainId = 16 WHERE InternalChainId = 7;
            UPDATE AuraTx SET InternalChainId = 17 WHERE InternalChainId = 8;
            UPDATE AuraTx SET InternalChainId = 18 WHERE InternalChainId = 11;

            UPDATE MultisigConfirm SET InternalChainId = 12 WHERE InternalChainId = 3;
            UPDATE MultisigConfirm SET InternalChainId = 13 WHERE InternalChainId = 4;
            UPDATE MultisigConfirm SET InternalChainId = 14 WHERE InternalChainId = 5;
            UPDATE MultisigConfirm SET InternalChainId = 15 WHERE InternalChainId = 6;
            UPDATE MultisigConfirm SET InternalChainId = 16 WHERE InternalChainId = 7;
            UPDATE MultisigConfirm SET InternalChainId = 17 WHERE InternalChainId = 8;
            UPDATE MultisigConfirm SET InternalChainId = 18 WHERE InternalChainId = 11;

            UPDATE MultisigTransaction SET InternalChainId = 12 WHERE InternalChainId = 3;
            UPDATE MultisigTransaction SET InternalChainId = 13 WHERE InternalChainId = 4;
            UPDATE MultisigTransaction SET InternalChainId = 14 WHERE InternalChainId = 5;
            UPDATE MultisigTransaction SET InternalChainId = 15 WHERE InternalChainId = 6;
            UPDATE MultisigTransaction SET InternalChainId = 16 WHERE InternalChainId = 7;
            UPDATE MultisigTransaction SET InternalChainId = 17 WHERE InternalChainId = 8;
            UPDATE MultisigTransaction SET InternalChainId = 18 WHERE InternalChainId = 11;

            UPDATE Safe SET InternalChainId = 12 WHERE InternalChainId = 3;
            UPDATE Safe SET InternalChainId = 13 WHERE InternalChainId = 4;
            UPDATE Safe SET InternalChainId = 14 WHERE InternalChainId = 5;
            UPDATE Safe SET InternalChainId = 15 WHERE InternalChainId = 6;
            UPDATE Safe SET InternalChainId = 16 WHERE InternalChainId = 7;
            UPDATE Safe SET InternalChainId = 17 WHERE InternalChainId = 8;
            UPDATE Safe SET InternalChainId = 18 WHERE InternalChainId = 11;

            UPDATE SafeOwner SET InternalChainId = 12 WHERE InternalChainId = 3;
            UPDATE SafeOwner SET InternalChainId = 13 WHERE InternalChainId = 4;
            UPDATE SafeOwner SET InternalChainId = 14 WHERE InternalChainId = 5;
            UPDATE SafeOwner SET InternalChainId = 15 WHERE InternalChainId = 6;
            UPDATE SafeOwner SET InternalChainId = 16 WHERE InternalChainId = 7;
            UPDATE SafeOwner SET InternalChainId = 17 WHERE InternalChainId = 8;
            UPDATE SafeOwner SET InternalChainId = 18 WHERE InternalChainId = 11;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
