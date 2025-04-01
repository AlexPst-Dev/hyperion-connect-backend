import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class UpdateBillingsTable1698734800014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing billing table if it exists
    await queryRunner.dropTable("billings", true, true);

    // Create the new billing table with a composite primary key
    await queryRunner.createTable(
      new Table({
        name: "billings",
        columns: [
          new TableColumn({
            name: "objective_id",
            type: "int",
            isPrimary: true,
          }),
          new TableColumn({
            name: "billing_id",
            type: "int",
            isPrimary: true,
          }),
          new TableColumn({
            name: "date",
            type: "date",
            isPrimary: true,
          }),
          new TableColumn({
            name: "global_amount",
            type: "decimal",
            precision: 10,
            scale: 2,
          }),
          new TableColumn({
            name: "is_monthly",
            type: "boolean",
            default: false,
          }),
          new TableColumn({
            name: "monthly_amount",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          }),
          new TableColumn({
            name: "payment_received",
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

    await queryRunner.createForeignKey(
      "billings",
      new TableForeignKey({
        columnNames: ["objective_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "objectives",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("billings");
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("objective_id") !== -1
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("billings", foreignKey);
    }
    await queryRunner.dropTable("billings");
  }
}
