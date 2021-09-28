## Description

This repository is a NodeJS backend service developed in TypeScript using the [NestJS](https://github.com/nestjs/nest) framework.

It allows the guests to check the availability of units with extra flexibility, for more details check this [repo](https://github.com/muhannadst/coding-test).

## Requirements/Notes

If running the service locally:
* Make sure to have a local relational DB server installed and running
* Create ormconfig.env in the root directory of the service (check ormconfig.example.env for reference)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Setting up the database


⚠ The first time you run the app make sure `TYPEORM_SYNCHRONIZE` is equal to `true` in `ormconfig.env`
in order to have the tables and types created in your database.

On the second run if you keep it set to true it will reinitialize the tables and type in the DB.

After running the app, take the content of src/seeds/seed-test-data.sql and run it in your dabatase.
