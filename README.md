## About
[📖 Mind of Apollo Explained](https://mindofapollo.org/about.html)

## Architecture
### Tech Stack
PostgreSQL, NodeJS, TypeScript, SolidStart, SolidJS, Tailwind

### Shared Table Definitions
This is a CRUD app full of web forms, and its architecture is optimized for that. Central to this application are table definitions that are stored in `src/tables`. Not only is the DB schema generated from them, but also API endpoints, DB queries, authorization, and UI views are mostly generic and pull all of the domain knowledge dynamically from the shared table definitions. In effect, the application is split into two parts: (1) storage of domain knowledge and (2) domain-agnostic generic code.

The main benefit of this approach is that the code is a lot more DRY. As a result, the code stays internally consistent and it's faster to read and modify. Potential downsides are that the code is more abstract, and the application allows for less customization and fine-tuning or requires breaking the abstraction to achieve it.  

## Local Setup
### Prerequisites
* Node.js v22.14.0 (LTS)
* PostgreSQL 16.10
* postgresql-16-pgroonga
* pg-schema-diff

### Commands to run
Please replace `your_db_password` with your actual DB password
```
git clone https://github.com/vdzk/mindofapollo.git
cd mindofapollo
npm install
createdb -U postgres -h localhost -p 5432 mindofapollo
echo "DB_HOST=localhost" >> .env
echo "DB_PORT=5432" >> .env
echo "DB_NAME=mindofapollo" >> .env
echo "DB_USERNAME=postgres" >> .env
echo "DB_PASSWORD=your_db_password" >> .env
npx tsx src/schema/createDbSchema.ts
pg-schema-diff apply --dsn "postgres://postgres:your_db_password@localhost:5432/mindofapollo" --schema-dir schema-dir
psql "postgres://postgres:your_db_password@localhost:5432/mindofapollo" -f seed.sql
npm run debug
```

### Default Login
email: admin  
password: admin  
