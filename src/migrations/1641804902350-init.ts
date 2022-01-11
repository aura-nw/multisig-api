import { MigrationInterface, QueryRunner } from "typeorm";

export class init1641804902350 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE TABLE AuraTx (
            CreatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            UpdatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            Id int(11) NOT NULL AUTO_INCREMENT,
            Code varchar(255) COLLATE utf8_unicode_ci,
            CodeSpace varchar(255) COLLATE utf8_unicode_ci,
            Data varchar(255) COLLATE utf8_unicode_ci,
            GasUsed float,
            GasWanted float,
            Height varchar(255) COLLATE utf8_unicode_ci,
            Info varchar(255) COLLATE utf8_unicode_ci,
            Logs varchar(255) COLLATE utf8_unicode_ci,
            RawLogs varchar(255) COLLATE utf8_unicode_ci,
            TimeStamp timestamp,
            Tx varchar(255) COLLATE utf8_unicode_ci,
            TxHash varchar(255) COLLATE utf8_unicode_ci,
            PRIMARY KEY (Id),
            INDEX (TxHash)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
          
          CREATE TABLE Chain (
            CreatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            UpdatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            Id int(11) NOT NULL AUTO_INCREMENT,
            Name varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Rest varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Rpc varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Websocket varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            PRIMARY KEY (Id)
          ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
          
          CREATE TABLE MultisigConfirm (
            CreatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            UpdatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            Id int(11) NOT NULL AUTO_INCREMENT,
            OwnerAddress varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            MultisigTransactionId int(11) NOT NULL,
            BodyBytes varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Signature varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            ChainId varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            PRIMARY KEY (Id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
          
          CREATE TABLE MultisigTransaction (
            CreatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            UpdatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            Id int(11) NOT NULL AUTO_INCREMENT,
            SafeId int(11) NOT NULL,
            FromAddress varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            ToAddress varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Signature varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            ChainId varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Gas float NOT NULL,
            GasAmount float NOT NULL,
            MultisigPubkey varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            AuraTxId int(11) NOT NULL,
            Map varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Amount float NOT NULL,
            TypeUrl varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Sequence varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Msg varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Memo varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            PRIMARY KEY (Id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
          
          CREATE TABLE Owner (
            CreatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            UpdatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            Id int(11) NOT NULL AUTO_INCREMENT,
            Name varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Pubkey varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            PRIMARY KEY (Id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
          
          CREATE TABLE Safe (
            CreatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            UpdatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            Id int(11) NOT NULL AUTO_INCREMENT,
            Threshold int(11) NOT NULL,
            SafeAddress varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
            Status varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            CreatorAddress varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            SafePubkey varchar(800) COLLATE utf8_unicode_ci DEFAULT NULL,
            CreatorPubkey varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            ChainId int(11) NOT NULL,
            PRIMARY KEY (Id),
            UNIQUE KEY IDX_e9a9197d6fe789246111d3ad47 (SafeAddress)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
          
          CREATE TABLE SafeOwner (
            CreatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            UpdatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            Id int(11) NOT NULL AUTO_INCREMENT,
            Safe_Id varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Owner_Address varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Owner_Pubkey varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            PRIMARY KEY (Id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE AuraTx`);
        await queryRunner.query(`DROP TABLE Chain`);
        await queryRunner.query(`DROP TABLE MultisigConfirm`);
        await queryRunner.query(`DROP TABLE MultisigTransaction`);
        await queryRunner.query(`DROP TABLE Owner`);
        await queryRunner.query(`DROP TABLE Safe`);
        await queryRunner.query(`DROP TABLE SafeOwner`);
    }

}
