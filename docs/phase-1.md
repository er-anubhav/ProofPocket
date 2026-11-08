# Phase 1 — Foundation

Included: React/Vite/TypeScript landing and invoice upload preview; FastAPI health and invoice extraction route; BharatCode Responses integration; text-PDF parsing and image inputs; Pydantic schema with source text and confidence; Supabase browser client placeholder and initial RLS/private storage migration; Render blueprint.

Constraints: extraction endpoint is development-only and unauthenticated; scanned PDFs need OCR; extracted data is not verified until reviewed; files are not persisted yet. Login/JWT verification and secure user-scoped persistence are next. Confirm actual BharatCode account compatibility for Responses API structured output and image input with a real API key before relying on the endpoint.
