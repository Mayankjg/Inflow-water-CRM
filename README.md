# Simple CRM — Next.js + NestJS + Prisma + PostgreSQL

A starter CRM for managing leads/inquiries, contacts, follow-ups, and a dashboard, with a Justdial webhook endpoint prepared for official integration.

## Stack
- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript, REST API
- ORM: Prisma
- Database: PostgreSQL
- Integration: `POST /api/integrations/justdial/webhook` (configure only after Justdial approves and provides payload/auth details)

## Requirements
- Node.js 20+
- npm
- PostgreSQL 15+
- Git (optional)

## 1. Configure PostgreSQL
Create a database named `simple_crm`, copy `backend/.env.example` to `backend/.env`, then set your PostgreSQL password in `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/simple_crm?schema=public"
PORT=4000
FRONTEND_URL="http://localhost:3000"
JUSTDIAL_WEBHOOK_SECRET="replace-with-a-long-random-secret"
```

Do not commit `.env` files or expose secrets in the frontend.

## 2. Start the backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```
API base URL: `http://localhost:4000/api`

Health check: `GET http://localhost:4000/api/health`

## 3. Start the frontend
In a second terminal:
```bash
cd frontend
npm install
```
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
Then:
```bash
npm run dev
```
Open `http://localhost:3000`.

## CRM modules included
- Dashboard: counts and latest leads
- Leads: create, list, update status, delete
- Contacts: create and list contacts
- Follow-ups: create and list follow-up tasks
- Settings: integration status and setup guidance
- Justdial webhook: accepts lead payloads, records source as `JUSTDIAL`, deduplicates by external lead ID when supplied

## Justdial integration checklist
1. Contact your Justdial relationship manager/support and request official CRM/API lead-push integration.
2. Ask for supported payload fields, authentication/signature method, retry behavior, and test mode.
3. Deploy the backend to a public HTTPS URL.
4. Configure the webhook route in Justdial using:
   `https://YOUR-BACKEND-DOMAIN/api/integrations/justdial/webhook`
5. Set `JUSTDIAL_WEBHOOK_SECRET` and adapt the verification logic to Justdial's documented authentication method.
6. Test using a real test inquiry and confirm it appears in Leads with source `JUSTDIAL`.

**Important:** This endpoint is a prepared template, not proof that Justdial has enabled access. The included shared-secret header (`x-webhook-secret`) is a placeholder; replace it with the exact authentication method Justdial supports. Do not scrape Justdial or assume API access exists.

## Notes before production
- Add a full authentication/session implementation before public launch.
- Configure HTTPS, CORS, rate limiting, request validation, database backups, logging, and monitoring.
- Add role-based permissions and audit logs if multiple employees will use the CRM.
- Use soft-delete/archiving rather than permanently deleting business records if retention matters.
- Review all API validation and webhook security against the official Justdial documentation before enabling the integration.
