import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class CreateClientTable1698784800021 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'client',
      columns: [
        new TableColumn({
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        }),
        new TableColumn({
          name: 'professional_id',
          type: 'int',
        }),
        new TableColumn({
          name: 'list_of_client_ids',
          type: 'varchar',
          isNullable: true,
        }),
      ],
    }), true);

    await queryRunner.createForeignKey('client', new TableForeignKey({
      columnNames: ['professional_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('client');
    const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf('professional_id') !== -1);
    if (table && foreignKey) {
      await queryRunner.dropForeignKey('client', foreignKey);
    }
    await queryRunner.dropTable('client');
  }
}
