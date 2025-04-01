import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateUserMigration1698734800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the users table
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "first_name",
            type: "varchar",
          }),
          new TableColumn({
            name: "last_name",
            type: "varchar",
          }),
          new TableColumn({
            name: "email",
            type: "varchar",
            isUnique: true,
          }),
          new TableColumn({
            name: "phone",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "password",
            type: "varchar",
          }),
          new TableColumn({
            name: "street",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "city",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "pc",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "profile_category",
            type: "varchar",
          }),
          new TableColumn({
            name: "description",
            type: "text",
            isNullable: true,
          }),
          new TableColumn({
            name: "image",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "birth_date",
            type: "date",
            isNullable: true,
          }),
          new TableColumn({
            name: "link_strava",
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

    // Create the sportsman table
    await queryRunner.createTable(
      new Table({
        name: "sportsman",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
          }),
          new TableColumn({
            name: "sport_category",
            type: "int",
            isNullable: true,
          }),
          new TableColumn({
            name: "dispo_days",
            type: "char",
            length: "7",
            isNullable: true,
          }),
          new TableColumn({
            name: "dispo_time",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "list_medic_notes",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "list_medic_files",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "list_medics_ids",
            type: "varchar",
            isNullable: true,
          }),
          new TableColumn({
            name: "graph_id",
            type: "int",
            isNullable: true,
          }),
          new TableColumn({
            name: "subscription_id",
            type: "int",
            isNullable: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          }),
        ],
      }),
      true
    );

    // Create the coach table
    await queryRunner.createTable(
      new Table({
        name: "coach",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
          }),
          new TableColumn({
            name: "sport_category",
            type: "int",
            isNullable: true,
          }),
          new TableColumn({
            name: "can_import_sessions",
            type: "boolean",
            default: false,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          }),
        ],
      }),
      true
    );

    // Create the medic table
    await queryRunner.createTable(
      new Table({
        name: "medic",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
          }),
          new TableColumn({
            name: "medic_category",
            type: "int",
            isNullable: true,
          }),
          new TableColumn({
            name: "can_import_sessions",
            type: "boolean",
            default: false,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          }),
        ],
      }),
      true
    );

    // Create the free_user table
    await queryRunner.createTable(
      new Table({
        name: "free_user",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          }),
        ],
      }),
      true
    );

    // Create the partner table
    await queryRunner.createTable(
      new Table({
        name: "partner",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
          }),
          new TableColumn({
            name: "company_id",
            type: "int",
            isNullable: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          }),
        ],
      }),
      true
    );

    // Create the admin table
    await queryRunner.createTable(
      new Table({
        name: "admin",
        columns: [
          new TableColumn({
            name: "id",
            type: "int",
            isPrimary: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          }),
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the tables in reverse order of creation
    await queryRunner.dropTable("admin");
    await queryRunner.dropTable("partner");
    await queryRunner.dropTable("free_user");
    await queryRunner.dropTable("medic");
    await queryRunner.dropTable("coach");
    await queryRunner.dropTable("sportsman");
    await queryRunner.dropTable("users");
  }
}

export class UpdateUserMigration1698734800016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key for sportsman.sport_category
    await queryRunner.createForeignKey(
      "sportsman",
      new TableForeignKey({
        columnNames: ["sport_category"],
        referencedColumnNames: ["id"],
        referencedTableName: "categories",
        onDelete: "SET NULL",
      })
    );

    // Add foreign key for coach.sport_category
    await queryRunner.createForeignKey(
      "coach",
      new TableForeignKey({
        columnNames: ["sport_category"],
        referencedColumnNames: ["id"],
        referencedTableName: "categories",
        onDelete: "SET NULL",
      })
    );

    // Add foreign key for medic.medic_category
    await queryRunner.createForeignKey(
      "medic",
      new TableForeignKey({
        columnNames: ["medic_category"],
        referencedColumnNames: ["id"],
        referencedTableName: "categories",
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const sportsmanTable = await queryRunner.getTable("sportsman");
    const coachTable = await queryRunner.getTable("coach");
    const medicTable = await queryRunner.getTable("medic");

    const sportsmanForeignKey = sportsmanTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("sport_category") !== -1
    );
    const coachForeignKey = coachTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("sport_category") !== -1
    );
    const medicForeignKey = medicTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("medic_category") !== -1
    );

    if (sportsmanForeignKey) {
      await queryRunner.dropForeignKey("sportsman", sportsmanForeignKey);
    }
    if (coachForeignKey) {
      await queryRunner.dropForeignKey("coach", coachForeignKey);
    }
    if (medicForeignKey) {
      await queryRunner.dropForeignKey("medic", medicForeignKey);
    }
  }
}
