import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateOffersTable1698734800008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the base offers table
    await queryRunner.createTable(
      new Table({
        name: "offers",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "company_id",
            type: "int",
          }),
          new TableColumn({
            name: "offer_category",
            type: "varchar",
          }),
          new TableColumn({
            name: "title",
            type: "varchar",
          }),
          new TableColumn({
            name: "description",
            type: "text",
          }),
          new TableColumn({
            name: "conditions",
            type: "text",
            isNullable: true,
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
      "offers",
      new TableForeignKey({
        columnNames: ["company_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "companies",
        onDelete: "CASCADE",
      })
    );

    // Create the discount_offer table
    await queryRunner.createTable(
      new Table({
        name: "discount_offer",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
          }),
          new TableColumn({
            name: "amount",
            type: "decimal",
            precision: 10,
            scale: 2,
          }),
          new TableColumn({
            name: "link",
            type: "varchar",
            isNullable: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["id"],
            referencedTableName: "offers",
            referencedColumnNames: ["id"],
          }),
        ],
      }),
      true
    );

    // Create the sponsorship_offer table
    await queryRunner.createTable(
      new Table({
        name: "sponsorship_offer",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
          }),
          new TableColumn({
            name: "nb_person_max",
            type: "int",
          }),
          new TableColumn({
            name: "person_ongoing_ids",
            type: "varchar",
            isNullable: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["id"],
            referencedTableName: "offers",
            referencedColumnNames: ["id"],
          }),
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the tables in reverse order of creation
    await queryRunner.dropTable("sponsorship_offer");
    await queryRunner.dropTable("discount_offer");
    await queryRunner.dropTable("offers");
  }
}
