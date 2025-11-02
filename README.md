## About
[📖 Mind of Apollo Explained](https://mindofapollo.org/about.html)

## Local Setup
### Prerequisites
* Node.js v22.14.0 (LTS)
* PostgreSQL 16.10
* postgresql-16-pgroonga
* pg-schema-diff

### Commands to run
Please replace "your_db_password" with your actual DB password
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
