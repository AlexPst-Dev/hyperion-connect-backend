import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateBillingsTable1698734800006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "billings",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "objective_id",
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
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf("objective_id") !== -1
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey("billings", foreignKey);
      }
    }
    await queryRunner.dropTable("billings");
  }
}
