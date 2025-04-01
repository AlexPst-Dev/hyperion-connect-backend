import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateSessionsTable1698734800002 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'sessions',
      columns: [
        new TableColumn({
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        }),
        new TableColumn({
          name: 'label',
          type: 'varchar',
        }),
        new TableColumn({
          name: 'nb_exercises',
          type: 'int',
        }),
        new TableColumn({
          name: 'duration_time',
          type: 'varchar',
        }),
        new TableColumn({
          name: 'file_picture_id',
          type: 'int',
          isNullable: true,
        }),
        new TableColumn({
          name: 'list_exercises',
          type: 'varchar',
          isNullable: true,
        }),
        new TableColumn({
          name: 'recommendations',
          type: 'varchar',
          isNullable: true,
        }),
        new TableColumn({
          name: 'contributions',
          type: 'varchar',
          isNullable: true,
        }),
        new TableColumn({
          name: 'done',
          type: 'boolean',
          default: false,
        }),
        new TableColumn({
          name: 'is_active',
          type: 'boolean',
          default: true,
        }),
        new TableColumn({
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        }),
        new TableColumn({
          name: 'updated_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        }),
      ],
    }), true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('sessions');
  }
}
