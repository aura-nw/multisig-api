import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeOldChain1717382328993 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM Chain WHERE id = 4;
        update Chain set chainId = "aura_6322-2" where id = 3;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
