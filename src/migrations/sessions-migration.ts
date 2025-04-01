import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateSessionsTable1698734800002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "sessions",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "label",
            type: "varchar",
          }),
          new TableColumn({
            name: "nb_exercises",
            type: "int",
          }),
          new TableColumn({
            name: "duration_time",
            type: "varchar",
          }),
          new TableColumn({
            name: "file_picture_id",
            type: "int",
            isNullable: true,
          }),
          new TableColumn({
            name: "list_exercises",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "recommendations",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "contributions",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "done",
            type: "boolean",
            default: false,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("sessions");
  }
}
export class UpdateSessionsTable1698734800017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key for sessions.file_picture_id
    await queryRunner.createForeignKey(
      "sessions",
      new TableForeignKey({
        columnNames: ["file_picture_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "files",
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("sessions");
    if (!table) {
      throw new Error("Table 'sessions' not found.");
    }
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("file_picture_id") !== -1
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("sessions", foreignKey);
    }
  }
}
