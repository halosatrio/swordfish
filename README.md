# Swordfish - `dinero` backend service

personal financial tracker tools. input cashflow, show cashflow on table. tools used: Bun, Hono, Drizzle-Orm.

## TODO:

- [ ] auth
  - [ ] register
  - [ ] login
  - [ ] get user
- [ ] transactions
  - [ ] input cashflow: amount, date, category, notes
  - [ ] edit cashflow: amount, category, notes
  - [ ] get cashflow: by date, by month
  - [ ] get outflow, inflow: by month, by category, by quarter

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

- generate with `bunx drizzle-kit generate:pg`
- migrate with `bun migrate.ts`
