import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateCompanyTable1698734800007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "company",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "responsible_id",
            type: "int",
          }),
          new TableColumn({
            name: "name",
            type: "varchar",
          }),
          new TableColumn({
            name: "file_image_company_id",
            type: "int",
            isNullable: true,
          }),
          new TableColumn({
            name: "description",
            type: "text",
            isNullable: true,
          }),
          new TableColumn({
            name: "date_end_membership",
            type: "date",
            isNullable: true,
          }),
          new TableColumn({
            name: "city",
            type: "varchar",
          }),
          new TableColumn({
            name: "pc",
            type: "varchar",
          }),
          new TableColumn({
            name: "street",
            type: "varchar",
          }),
          new TableColumn({
            name: "link_website",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "link_fb",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "link_insta",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "link_linkedin",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "link_tiktok",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "link_youtube",
            type: "varchar",
            isNullable: true,
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
      "company",
      new TableForeignKey({
        columnNames: ["responsible_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "company",
      new TableForeignKey({
        columnNames: ["file_image_company_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "files",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("company");
    if (table) {
      const foreignKeys = table.foreignKeys;

      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey("company", foreignKey);
      }
    }

    await queryRunner.dropTable("company");
  }
}
