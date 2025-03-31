import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateObjectivesTable1698734800006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "objectives",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "sportsman_id",
            type: "int",
          }),
          new TableColumn({
            name: "label",
            type: "varchar",
          }),
          new TableColumn({
            name: "responsible_id",
            type: "int",
          }),
          new TableColumn({
            name: "start_date",
            type: "date",
          }),
          new TableColumn({
            name: "end_date",
            type: "date",
          }),
          new TableColumn({
            name: "is_active",
            type: "boolean",
            default: true,
          }),
          new TableColumn({
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          }),
          new TableColumn({
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          }),
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "objectives",
      new TableForeignKey({
        columnNames: ["sportsman_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "objectives",
      new TableForeignKey({
        columnNames: ["responsible_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("objectives");
    if (table) {
      const foreignKeys = table.foreignKeys;

      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey("objectives", foreignKey);
      }
    }

    await queryRunner.dropTable("objectives");
  }
}
