# Local setup

## 1. Supabase

1. Create a Supabase project.
2. Copy the project URL and publishable/anon key.
3. Put them in `frontend/.env.local` and `backend/.env`.
4. Put the service-role key only in `backend/.env`; never expose it to Vite.
5. Run `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL editor.
6. In Authentication → URL Configuration, set the local site URL to `http://localhost:5173`.
7. Configure email confirmation according to your testing preference.

## 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set `BHARATCODE_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` in backend/.env, then run:

```bash
uvicorn app.main:app --reload --port 8000
```

## 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Set the Vite Supabase URL and anon/publishable key in frontend/.env.local.

## 4. First authenticated extraction

Create an account in the UI, confirm the email if confirmation is enabled, sign in, and upload a text-based PDF or supported image. The browser sends the Supabase access token as a Bearer token. FastAPI validates it against Supabase before accepting the upload.

The current extraction route returns model output only. It does not yet store the source file or extracted record. Do not use real sensitive documents in this development milestone.
