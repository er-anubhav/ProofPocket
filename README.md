# ProofPocket

**Your purchases. Your proofs. Your peace of mind.**

ProofPocket transforms invoices, receipts and warranty documents into evidence-backed ownership records.

## Phase 1 stack

- Frontend: React 19, Vite, TypeScript, Tailwind CSS v4
- API: FastAPI, Pydantic
- AI: BharatCode API, configured for `qwen-3.8-27b`
- Auth: Supabase Auth (email/password)
- Database and private files: Supabase Postgres + Storage
- Deployment: Vercel + Render

## Repository structure

- `frontend/` — consumer web application
- `backend/` — FastAPI API and document intelligence
- `supabase/migrations/` — database and private-storage policies
- `docs/` — setup and implementation notes
- `BharatCode.txt` — competition integration declaration
- `render.yaml` — Render Blueprint
- `.github/workflows/ci.yml` — frontend/backend CI

## Local development

Follow [docs/local-setup.md](docs/local-setup.md).

Quick start:

```bash
# Terminal 1 — API
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add credentials to backend/.env, then:
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
cp .env.example .env.local
# Add Supabase URL and publishable/anon key, then:
npm run dev
```

Frontend: http://localhost:5173  
API docs: http://localhost:8000/docs

## Current functionality

- Supabase email/password sign-up and sign-in.
- FastAPI validates Supabase access tokens on authenticated routes.
- Invoice extraction accepts PDF, JPEG, PNG and WEBP (10 MB maximum).
- Text-based PDFs are parsed locally; images are sent to BharatCode vision input.
- Structured extraction includes source text and confidence per field.
- Missing warranty details remain unknown rather than being guessed.

## Important limitations

- The invoice endpoint currently returns extraction output; it does **not** yet persist uploaded documents or create ownership records.
- Scanned PDFs need OCR; use text PDFs or supported page images for now.
- Extracted values must be reviewed by the user before being considered verified.
- Per-user rate limits, durable upload storage and extraction persistence are next implementation tasks.

## Supabase setup

Run `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL Editor. It creates user-owned tables with RLS and a private `ownership-documents` bucket.

## Deployment

- Vercel project root: `frontend`
- Render Blueprint: root `render.yaml`
- Configure `VITE_API_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` in Vercel.
- Configure BharatCode and Supabase secrets in Render. Never put a service-role key or BharatCode key in frontend variables.

The extraction endpoint requires Supabase authentication in all environments. Do not deploy until real credentials, provider compatibility, CORS origin and rate limits have been checked.

## Security principles

- Never commit API keys, service-role keys, or private documents.
- Keep Supabase Storage private.
- Validate user sessions server-side.
- Never infer warranty terms absent from source documents.
- Treat model output as unverified until the user reviews it.
