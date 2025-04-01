import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateEventsTable1698734800006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the base events table
    await queryRunner.createTable(
      new Table({
        name: "events",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "event_category",
            type: "varchar",
          }),
          new TableColumn({
            name: "responsible_ids",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "person_ongoing_ids",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "location",
            type: "varchar",
          }),
          new TableColumn({
            name: "date",
            type: "date",
          }),
          new TableColumn({
            name: "time",
            type: "time",
          }),
          new TableColumn({
            name: "description",
            type: "text",
            isNullable: true,
          }),
          new TableColumn({
            name: "link",
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

    // Create the hyperlink_event table
    await queryRunner.createTable(
      new Table({
        name: "hyperlink_event",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
          }),
          new TableColumn({
            name: "theme",
            type: "varchar",
            isNullable: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["id"],
            referencedTableName: "events",
            referencedColumnNames: ["id"],
          }),
        ],
      }),
      true
    );

    // Create the coaching_event table
    await queryRunner.createTable(
      new Table({
        name: "coaching_event",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
          }),
          new TableColumn({
            name: "session_id",
            type: "int",
            isNullable: true,
          }),
          new TableColumn({
            name: "is_done",
            type: "boolean",
            isNullable: true,
          }),
          new TableColumn({
            name: "sportsman_comment",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "sportsman_note",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "coach_comment",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "coach_note",
            type: "varchar",
            isNullable: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["id"],
            referencedTableName: "events",
            referencedColumnNames: ["id"],
          }),
          new TableForeignKey({
            columnNames: ["session_id"],
            referencedTableName: "sessions",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        ],
      }),
      true
    );

    // Create the sporting_activity_event table
    await queryRunner.createTable(
      new Table({
        name: "sporting_activity_event",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
          }),
          new TableColumn({
            name: "max_participants",
            type: "int",
            isNullable: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["id"],
            referencedTableName: "events",
            referencedColumnNames: ["id"],
          }),
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the tables in reverse order of creation
    await queryRunner.dropTable("sporting_activity_event");
    await queryRunner.dropTable("coaching_event");
    await queryRunner.dropTable("hyperlink_event");
    await queryRunner.dropTable("events");
  }
}
