import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateSubscriptionsTable1698734800013
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "subscriptions",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "is_bilan_complete",
            type: "boolean",
            default: true,
          }),
          new TableColumn({
            name: "monthly_monitoring_category",
            type: "enum",
            enum: ["COMPLETE", "DIETETIC", "MENTAL_COACHING"],
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
            name: "other_servises",
            type: "varchar",
          }),
          new TableColumn({
            name: "subscription_file_id",
            type: "int",
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
      "subscriptions",
      new TableForeignKey({
        columnNames: ["subscription_file_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "files",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("subscriptions");
    if (!table) {
      throw new Error("Table 'subscriptions' not found");
    }
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("subscription_file_id") !== -1
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("subscriptions", foreignKey);
    }
    await queryRunner.dropTable("subscriptions");
  }
}
