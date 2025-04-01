import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class CreateNotificationsTable1698734800011
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "notifications",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "notification_category",
            type: "enum",
            enum: ["HOME_POPUP", "NEWS"],
          }),
          new TableColumn({
            name: "title",
            type: "varchar",
          }),
          new TableColumn({
            name: "text",
            type: "text",
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
    await queryRunner.dropTable("notifications");
  }
}
