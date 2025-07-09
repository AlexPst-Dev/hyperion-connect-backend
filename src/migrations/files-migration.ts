import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class CreateFilesTable1698734800010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "files",
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
            name: "physicalName",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "url",
            type: "varchar",
          }),
          new TableColumn({
            name: "file_category",
            type: "enum",
            enum: ["IMAGE", "MEDICAL_FILE", "SESSION_IMPORTED", "SUBSCRIPTION"],
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
    await queryRunner.dropTable("files");
  }
}
