# Project Initialization Guide

This guide provides the necessary steps and commands to initialize the project and set up the database using TypeORM.

## Prerequisites

- Node.js and npm installed on your machine.
- MySQL database server installed and running.
- Environment variables configured in a `.env` file.

## Steps to Initialize the Project

### 1. Clone the Repository

Clone the project repository to your local machine:

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Dependencies

Install the necessary npm packages:

```bash
npm install
```

### 3. Set Up Environment Variables

Create a .env file in the root directory of the project and add the following environment variables:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=yourpassword
DB_NAME=dev_hyperion
```

### 4. Start the Application

Start your application using the following command:

```bash
npm run dev
```

### 5. Run Migrations

Run the TypeORM migrations to set up the database schema:

```bash
npm run typeorm migration:run
```

### Additional Commands

#### Generate a New Migration:

```bash
npm run typeorm migration:generate -n <MigrationName>
```

#### Revert the Last Migration:

```bash
npm run typeorm migration:revert
```

#### Show Migration Status:

```bash
npm run typeorm migration:show
```
