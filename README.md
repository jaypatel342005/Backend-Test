# Ticket System API

A backend for a ticketing system built with NestJS and Prisma (MySQL).

## Requirements

- Node.js (v18+)
- MySQL database
- npm

## Setup

Clone the repo and install packages:

```bash
npm install
```

Create a `.env` file in the root:

```
DATABASE_URL="mysql://root:password@localhost:3306/ticket_system"
JWT_SECRET="your_jwt_secret_here"
```

Generate the Prisma client:

```bash
npx prisma generate
```

## Database Setup

Make sure the `roles` table has the three roles inserted:

```sql
INSERT INTO roles (name) VALUES ('MANAGER'), ('SUPPORT'), ('USER');
```

Then create your first MANAGER user directly in the database (password must be bcrypt hashed).

## Running

```bash
# dev
npm run start:dev

# production
npm run start:prod
```

## API Docs

After starting the app, Swagger UI is available at:

```
http://localhost:3000/docs
```

## Testing Flow

1. Login as MANAGER via `POST /auth/login`
2. Use the token to create SUPPORT and USER accounts via `POST /users`
3. Login as those users and test their respective permissions
4. Try invalid status transitions (e.g. OPEN → RESOLVED) — should return 400
5. Try accessing endpoints without a token — should return 401
6. Try accessing endpoints with the wrong role — should return 403

## Roles

| Role    | Permissions                                     |
| ------- | ----------------------------------------------- |
| MANAGER | Full access                                     |
| SUPPORT | View/update assigned tickets and their comments |
| USER    | Create tickets, view own tickets and comments   |
