# Swordfish - `dinero` backend service

personal financial tracker tools. input cashflow, show cashflow on table. tools used: Bun, Hono, Drizzle-Orm.

## TODO:

- [x] auth
  - [x] register
  - [x] login
  - [x] get user
- [x] transactions
  - [x] input cashflow: amount, date, category, notes
  - [x] edit cashflow by id: amount, category, notes
  - [x] delete cashflow by id
  - [x] get cashflow: by date, by month
  - [ ] get outflow, inflow: by month, by category, by quarter
- [x] reports
  - [x] quarterly, annually, by category
- [ ] assets
- [ ] advance
  - [ ] cookie based token

## Endpoints:

- POST register user
- POST auth - login user
- POST input cashflow
- PUT edit cashflow
- DELETE transaction
- GET cashflow, params: date, month, category (?)
- GET Summary and Reports by date-range (months, quarter)

## Development:

To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

open http://localhost:3000

## DB related

if we make some changes in schema:

- generate with `bunx drizzle-kit generate`
- migrate with `bun migrate.ts`

## Running Docker

```sh
docker build -t halosatrio/swordfish:v1 .

docker run -d -p 3000:3000 --env-file ./.env [container-name]
```
