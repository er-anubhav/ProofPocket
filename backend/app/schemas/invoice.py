from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class ExtractedField(BaseModel):
    model_config = ConfigDict(extra="forbid")
    value: str | None
    source_text: str | None
    confidence: float = Field(ge=0, le=1)


class InvoiceExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    document_type: Literal["invoice", "receipt", "order_confirmation", "other"]
    merchant: ExtractedField
    invoice_number: ExtractedField
    purchase_date: ExtractedField
    customer_name: ExtractedField
    product_name: ExtractedField
    brand: ExtractedField
    model_number: ExtractedField
    serial_number: ExtractedField
    quantity: ExtractedField
    total_amount: ExtractedField
    currency: ExtractedField
    tax_amount: ExtractedField
    warranty_duration: ExtractedField
    warranty_expiry: ExtractedField
    notes: list[str]
    missing_information: list[str]
