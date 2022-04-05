import { MigrationInterface, QueryRunner } from "typeorm";

export class implementSmartContract1649127088532 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE SmartContractTx (
                CreatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UpdatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                Id int(11) NOT NULL AUTO_INCREMENT,
                SafeId int(11) NOT NULL,
                FromAddress varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                ContractAddress varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                \`Function\` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                Parameters varchar(255) COLLATE utf8_unicode_ci,
                Gas float NOT NULL,
                Fee float NOT NULL,
                TxHash varchar(255) COLLATE utf8_unicode_ci,
                Status VARCHAR(45) NOT NULL,
                TypeUrl varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                InternalChainId int(11) NOT NULL,
                AccountNumber VARCHAR(255),
                Sequence varchar(255),
                PRIMARY KEY (Id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

            ALTER TABLE MultisigConfirm ADD COLUMN SmartContractTxId INT(11) AFTER MultisigTransactionId;
            ALTER TABLE MultisigConfirm MODIFY MultisigTransactionId INT(11);
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE SmartContractTx`);
    }

}
