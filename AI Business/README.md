# AI Business Website Generator (SaaS Starter)

Production-ready full-stack SaaS starter where users generate a complete business website using AI by entering business details.

## Folder structure

```
AI Business Website Generator/
  frontend/
    app/
      dashboard/
      login/
      signup/
      preview/[websiteId]/
    components/
    templates/
    lib/
  backend/
    routes/
    controllers/
    models/
    middleware/
    config/
```

## Features included

- Landing page (modern SaaS UI)
- JWT authentication (signup/login) + bcrypt password hashing
- Dashboard layout (sidebar + navbar)
- Website generator (OpenAI → structured JSON)
- 3 templates: Restaurant, Gym, Salon
- Save websites per user in MongoDB
- Preview route: `/preview/[websiteId]`

## Backend API routes

- `POST /auth/signup`
- `POST /auth/login`
- `POST /generate-content` (auth required)
- `POST /websites` (auth required)
- `GET /websites` (auth required)
- `GET /websites/:id` (auth required)
- `GET /health`

## Database schema (MongoDB / Mongoose)

### User
- `name` (string)
- `email` (string, unique)
- `password` (string, hashed)
- `createdAt` (date)

### Website
- `userId` (ObjectId → User)
- `businessName` (string)
- `businessType` (string)
- `city` (string)
- `generatedContent` (Mixed JSON)
- `template` (`restaurant | gym | salon`)
- `createdAt` (date)

## Local setup

### 1) Backend (Express)

```bash
cd "AI Business Website Generator/backend"
npm install
cp .env.example .env
```

Edit `.env`:
- Set `MONGODB_URI`
- Set `JWT_SECRET`
- Set `OPENAI_API_KEY`

Run:

```bash
npm run dev
```

Backend runs on `http://localhost:8080`.

### 2) Frontend (Next.js + Tailwind)

```bash
cd "AI Business Website Generator/frontend"
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Deployment

### Frontend → Vercel

- **Environment variables**:
  - `NEXT_PUBLIC_API_URL` = your Render backend URL (example: `https://your-api.onrender.com`)
- Deploy `frontend/` as the Vercel project root (or set Root Directory to `frontend`).

### Backend → Render

- Deploy the `backend/` service as a Node Web Service
- **Environment variables**:
  - `PORT` = `8080` (Render may override)
  - `CLIENT_ORIGIN` = your Vercel URL (example: `https://your-app.vercel.app`)
  - `MONGODB_URI` = MongoDB Atlas connection string
  - `JWT_SECRET` = strong secret
  - `JWT_EXPIRES_IN` = `7d`
  - `OPENAI_API_KEY` = your key
  - `OPENAI_MODEL` = `gpt-4.1-mini` (or your preferred model)

### Database → MongoDB Atlas

- Create a cluster + database user
- Allowlist Render IPs (or `0.0.0.0/0` for quick testing)
- Paste Atlas URI into `MONGODB_URI`

## Notes / next improvements

- Add password reset (email), billing (Stripe), team/orgs, and template gallery previews
- Add rate limiting + request logging for production hardening
