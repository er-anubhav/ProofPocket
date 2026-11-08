from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.config import settings
from app.core.security import get_current_user
from app.schemas.invoice import InvoiceExtraction
from app.services.invoice_extraction import extract_invoice

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])
ALLOWED_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/webp"}


@router.post("/extract-invoice", response_model=InvoiceExtraction)
async def extract_invoice_endpoint(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    # Authentication is enforced here. This first endpoint extracts but does not persist.
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Upload PDF, JPEG, PNG or WEBP.")

    max_bytes = settings.max_upload_mb * 1024 * 1024
    raw = await file.read(max_bytes + 1)
    if not raw:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(raw) > max_bytes:
        raise HTTPException(status_code=413, detail=f"Maximum upload size is {settings.max_upload_mb} MB.")

    try:
        return extract_invoice(raw, file.content_type)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        print(f"Invoice extraction error for user {user.id}: {type(exc).__name__}: {exc}")
        raise HTTPException(status_code=502, detail="Invoice extraction failed. Check backend logs.") from exc
