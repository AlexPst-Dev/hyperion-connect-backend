import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateExercisesTable1698734800003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "exercises",
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
            name: "list_muscle_group_ids",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "duration_time",
            type: "varchar",
          }),
          new TableColumn({
            name: "description",
            type: "text",
            isNullable: true,
          }),
          new TableColumn({
            name: "recommendations",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "publicImageUrl",
            type: "string",
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("exercises");
  }
}
