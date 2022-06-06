import {MigrationInterface, QueryRunner} from "typeorm";

export class updateInternalChainId1654488591509 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            SET @ID=(SELECT Id FROM Chain WHERE Name = 'Aura Devnet');
            UPDATE Safe SET InternalChainId = @ID WHERE InternalChainId = 17;
            UPDATE AuraTx SET InternalChainId = @ID WHERE InternalChainId = 17;
            UPDATE MultisigConfirm SET InternalChainId = @ID WHERE InternalChainId = 17;
            UPDATE MultisigTransaction SET InternalChainId = @ID WHERE InternalChainId = 17;
            UPDATE SafeOwner SET InternalChainId = @ID WHERE InternalChainId = 17;
            UPDATE SmartContractTx SET InternalChainId = @ID WHERE InternalChainId = 17;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
