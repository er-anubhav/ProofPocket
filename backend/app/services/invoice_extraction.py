import base64
import json
from io import BytesIO

import fitz
from openai import OpenAI
from PIL import Image, UnidentifiedImageError

from app.core.config import settings
from app.schemas.invoice import InvoiceExtraction


SYSTEM_PROMPT = """
You are ProofPocket's invoice extraction engine.
Extract only information directly supported by the uploaded document.
Missing or unreadable values must be null, source_text null, confidence 0.
source_text must be a short verbatim supporting excerpt. Confidence is 0-1.
Never infer warranty duration or expiry. Dates use YYYY-MM-DD only when
unambiguous. Record ambiguity and conflicts in notes. Return schema only.
"""


def _client() -> OpenAI:
    if not settings.bharatcode_api_key:
        raise RuntimeError("BHARATCODE_API_KEY is not configured")
    return OpenAI(api_key=settings.bharatcode_api_key, base_url=settings.bharatcode_base_url, timeout=90.0, max_retries=1)


def _pdf_to_text(raw: bytes) -> str:
    with fitz.open(stream=raw, filetype="pdf") as document:
        pages = [f"[Page {i}]\n{page.get_text('text').strip()}" for i, page in enumerate(document, 1) if page.get_text("text").strip()]
    extracted = "\n\n".join(pages).strip()
    if not extracted:
        raise ValueError("No selectable text found. Scanned PDF OCR is not supported yet; upload a clear page image.")
    return extracted[:40000]


def _image_data_url(raw: bytes) -> str:
    try:
        image = Image.open(BytesIO(raw))
        image.verify()
        image_format = (image.format or "").upper()
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError("The uploaded file is not a valid image") from exc
    mime = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp"}.get(image_format)
    if not mime:
        raise ValueError("Only JPEG, PNG and WEBP images are supported")
    return f"data:{mime};base64,{base64.b64encode(raw).decode('ascii')}"


def extract_invoice(raw: bytes, content_type: str) -> InvoiceExtraction:
    if content_type == "application/pdf":
        content = [{"type": "input_text", "text": "Extract invoice details from this PDF text:\n\n" + _pdf_to_text(raw)}]
    else:
        content = [
            {"type": "input_text", "text": "Extract invoice information from this image."},
            {"type": "input_image", "image_url": _image_data_url(raw), "detail": "high"},
        ]
    response = _client().responses.create(
        model=settings.bharatcode_model,
        instructions=SYSTEM_PROMPT,
        input=[{"role": "user", "content": content}],
        text={"format": {"type": "json_schema", "name": "invoice_extraction", "strict": True, "schema": InvoiceExtraction.model_json_schema()}},
        max_output_tokens=3000,
        store=False,
    )
    if not response.output_text:
        raise RuntimeError("BharatCode returned an empty response")
    return InvoiceExtraction.model_validate(json.loads(response.output_text))
