import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateLinkedSessionsTable169878480467
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "linked_sessions",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "user_id",
            type: "int",
          }),
          new TableColumn({
            name: "session_id",
            type: "int",
          }),
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "linked_sessions",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "user",
        onDelete: "CASCADE",
      })
    );
    await queryRunner.createForeignKey(
      "linked_sessions",
      new TableForeignKey({
        columnNames: ["session_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "sessions",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("linked_sessions");
    const foreignKeySporstman = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("user_id") !== -1
    );
    const foreignKeySession = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("session_id") !== -1
    );
    if (table && foreignKeySporstman && foreignKeySession) {
      await queryRunner.dropForeignKey("linked_sessions", foreignKeySporstman);
      await queryRunner.dropForeignKey("linked_sessions", foreignKeySession);
    }
    await queryRunner.dropTable("linked_sessions");
  }
}
