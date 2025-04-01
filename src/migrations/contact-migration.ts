import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class CreateContactTable1698734800001 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'contact',
      columns: [
        new TableColumn({
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        }),
        new TableColumn({
          name: 'user_id',
          type: 'int',
        }),
        new TableColumn({
          name: 'list_of_contact_ids',
          type: 'varchar',
          isNullable: true,
        }),
      ],
    }), true);

    await queryRunner.createForeignKey('contact', new TableForeignKey({
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('contact');
    const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
    if (table && foreignKey) {
      await queryRunner.dropForeignKey('contact', foreignKey);
    }
    await queryRunner.dropTable('contact');
  }
}
