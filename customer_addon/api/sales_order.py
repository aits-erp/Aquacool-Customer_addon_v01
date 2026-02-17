import frappe
import json


@frappe.whitelist()
def get_customer_assets(customer, filters=None):

    # -----------------------------
    # Safe JSON parsing
    # -----------------------------
    if isinstance(filters, str):
        try:
            filters = json.loads(filters)
        except Exception:
            filters = {}

    filters = filters or {}

    # -----------------------------
    # Base condition (important)
    # -----------------------------
    conditions = {
        "parent": customer
    }

    # -----------------------------
    # Multi-select Location support
    # -----------------------------
    if filters.get("location"):
        conditions["location"] = ["in", filters.get("location")]

    # -----------------------------
    # Normal filters
    # -----------------------------
    for key in [
        "sub_location",
        "custom_item_group",
        "custom_item_code",
        "model",
        "type"
    ]:
        if filters.get(key):
            conditions[key] = filters.get(key)

    # -----------------------------
    # Fetch records
    # -----------------------------
    return frappe.get_all(
        "Customer Installed Asset",
        filters=conditions,
        fields=[
            "location",
            "sub_location",
            "sub_location_address",
            "custom_item_group",
            "custom_item_code",
            "model",
            "type",
            "amc",
            "start_date",
            "end_date",
            "warrenty"
        ],
        limit_page_length=1000
    )
