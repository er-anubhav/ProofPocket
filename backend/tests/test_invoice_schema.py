from app.schemas.invoice import ExtractedField, InvoiceExtraction


def test_extracted_field_accepts_explicit_unknown():
    field = ExtractedField(value=None, source_text=None, confidence=0)
    assert field.value is None
    assert field.source_text is None


def test_invoice_schema_is_strict():
    schema = InvoiceExtraction.model_json_schema()
    assert schema.get("additionalProperties") is False
    assert set(schema["required"]) == set(schema["properties"])
