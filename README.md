# VastraSilai AI Backend

Production-ready FastAPI backend for a tailoring shop management app, backed
directly by Supabase (Postgres + Auth) — no ORM, no SQLAlchemy, no Alembic.

## Tech stack

- FastAPI + Pydantic v2
- Supabase (Authentication + Postgres), accessed via direct `supabase-py` queries
- Python 3.12

## Project structure

```
backend/
├── app/
│   ├── routers/            # one router per resource
│   ├── schemas/             # Pydantic request/response models
│   ├── config.py            # loads & validates env vars
│   ├── main.py               # FastAPI app, wires up all routers
│   ├── supabase_client.py    # shared Supabase client(s)
│   └── dependencies.py       # auth dependency + ownership-check helpers
├── .env.example
├── requirements.txt
├── schema.sql
└── README.md
```

The only addition to the original layout is `app/dependencies.py`. Every
resource below `tailors` (customers, orders, measurements, payments,
notifications) needs the same two checks repeated everywhere: "who is the
calling tailor?" and "does this record actually belong to them?". Centralizing
that in one file kept every router file focused on just its own CRUD logic
instead of duplicating auth/ownership code nine times.

## Setup

1. Create a Supabase project, then run `schema.sql` in the SQL editor to
   create all six tables.
2. Copy `.env.example` to `.env` and fill in `SUPABASE_URL` and
   `SUPABASE_KEY` (the **anon/public** key — find both under Project
   Settings → API). Double-check there are no spaces around `=`.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
5. Open `http://127.0.0.1:8000/docs` for the interactive Swagger UI.

## Authentication flow

1. `POST /auth/register` creates a Supabase Auth user and a matching row in
   `tailors`, linked by `auth_user_id`.
2. `POST /auth/login` returns an `access_token`. Send this on every other
   request as:
   ```
   Authorization: Bearer <access_token>
   ```
3. Every protected endpoint resolves the token back to a `tailors` row via
   `get_current_tailor` in `dependencies.py`. All customer/order/payment/etc.
   data is scoped to that tailor — one tailor can never read or modify
   another tailor's data, even by guessing IDs.

If `SUPABASE_SERVICE_KEY` is set in `.env`, `DELETE /tailors/me` will also
remove the underlying Supabase Auth user. It's optional — without it,
account deletion still removes the tailor row (and, via `ON DELETE CASCADE`,
all of their customers/orders/measurements/payments/notifications) but the
Auth user itself is left behind.

## API reference

All routes except `/`, `/auth/register`, and `/auth/login` require the
`Authorization: Bearer <token>` header.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create a tailor account |
| POST | `/auth/login` | Log in, get an access token |

### Tailors
| Method | Path | Description |
|---|---|---|
| GET | `/tailors/me` | Get your own profile |
| PUT | `/tailors/me` | Update your profile |
| DELETE | `/tailors/me` | Delete your account (cascades) |

### Customers
| Method | Path | Description |
|---|---|---|
| POST | `/customers/` | Create a customer |
| GET | `/customers/` | List your customers |
| GET | `/customers/search?q=` | Search by name or phone |
| GET | `/customers/{customer_id}` | Get one customer |
| PUT | `/customers/{customer_id}` | Update a customer |
| DELETE | `/customers/{customer_id}` | Delete a customer |

### Measurements
| Method | Path | Description |
|---|---|---|
| POST | `/measurements/` | Add a measurement record for a customer |
| GET | `/measurements/{customer_id}` | Get a customer's measurement history |
| PUT | `/measurements/{measurement_id}` | Update a measurement record |
| DELETE | `/measurements/{measurement_id}` | Delete a measurement record |

### Orders
| Method | Path | Description |
|---|---|---|
| POST | `/orders/` | Create an order |
| GET | `/orders/` | List all your orders |
| GET | `/orders/{order_id}` | Get one order |
| PUT | `/orders/{order_id}` | Update an order (status, delivery date, etc.) |
| DELETE | `/orders/{order_id}` | Delete an order |

Order `status` values: `Pending`, `In Progress`, `Ready`, `Delivered`, `Cancelled`.

### Payments
| Method | Path | Description |
|---|---|---|
| POST | `/payments/` | Create a payment record for an order |
| GET | `/payments/` | List all your payments |
| GET | `/payments/{payment_id}` | Get one payment |
| PUT | `/payments/{payment_id}` | Update amounts (status recalculates automatically) |

`remaining_amount` and `payment_status` are always computed server-side from
`total_amount` and `advance_amount` — they're never accepted directly from
the client, so they can't drift out of sync.

### Notifications
| Method | Path | Description |
|---|---|---|
| POST | `/notifications/` | Create a notification tied to an order |
| GET | `/notifications/` | List all your notifications |

### Dashboard
| Method | Path | Description |
|---|---|---|
| GET | `/dashboard/cards` | All customers with their latest order + payment info |
| GET | `/dashboard/paid` | Customers whose latest payment is fully paid |
| GET | `/dashboard/unpaid` | Customers whose latest payment is unpaid |
| GET | `/dashboard/partial` | Customers with a partial payment |
| GET | `/dashboard/due-soon?days=3` | Customers with a delivery date within N days |
| GET | `/dashboard/search?q=` | Search dashboard cards by name or phone |

### Analytics
| Method | Path | Description |
|---|---|---|
| GET | `/analytics/customers/count` | Total customer count |
| GET | `/analytics/orders/count` | Total order count |
| GET | `/analytics/payments/summary` | Counts by payment status |
| GET | `/analytics/revenue/summary` | Total revenue / collected / outstanding |

## Testing with Postman

1. Call `POST /auth/login`, copy the `access_token` from the response.
2. In Postman, go to the **Authorization** tab on each request → type
   **Bearer Token** → paste the token.
3. For POST/PUT requests: **Body** tab → **raw** → set type to **JSON**
   (not Text) and send an actual JSON object, e.g.
   `{"customer_name": "Asha", "phone": "9876543210"}`.

## Known-issue fixes already baked in

- `email-validator` is in `requirements.txt`, so `EmailStr` works out of the box.
- `.env.example` shows the correct `KEY=value` format with no spaces.
- All schemas live only in `app/schemas/`, never imported back into their
  own router file by mistake, avoiding circular imports.
- Every router validates the request body via Pydantic, so a non-JSON or
  empty body returns a clean `422` instead of a server error.
