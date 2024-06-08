# Swordfish - `dinero` backend service

personal financial tracker tools. input cashflow, show cashflow on table. tools used: Bun, Hono, Drizzle-Orm.

## TODO:

- [ ] auth
  - [ ] register
  - [ ] login
- [ ] input cashflow: amount, date, category, notes
- [ ] edit cashflow: amount, category, notes
- [ ] get cashflow: by date, by month
- [ ] get outflow, inflow: by month, by category, by quarter

## Endpoints:

- POST register user
- POST auth - login user
- POST input cashflow
- PUT edit cashflow
- GET cashflow, params: date, month, category (?)

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
