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

export class UpdateExercisesTable1698734800018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add file_picture_id column to exercises table
    await queryRunner.addColumn(
      "exercises",
      new TableColumn({
        name: "file_picture_id",
        type: "int",
        isNullable: true,
      })
    );

    // Add foreign key for exercises.file_picture_id
    await queryRunner.createForeignKey(
      "exercises",
      new TableForeignKey({
        columnNames: ["file_picture_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "files",
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("exercises");
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("file_picture_id") !== -1
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("exercises", foreignKey);
    }

    await queryRunner.dropColumn("exercises", "file_picture_id");
  }
}
