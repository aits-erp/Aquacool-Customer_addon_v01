import frappe
import json


@frappe.whitelist()
def get_customer_assets(customer, filters=None):

    # Convert filters safely
    if isinstance(filters, str):
        try:
            filters = json.loads(filters)
        except Exception:
            filters = {}

    filters = filters or {}

    conditions = {"parent": customer}

    for key in [
        "location",
        "sub_location",
        "custom_item_group",
        "custom_item_code",
        "model",
        "type"
    ]:
        if filters.get(key):
            conditions[key] = filters.get(key)

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
        ]
    )
