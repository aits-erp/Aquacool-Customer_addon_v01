import frappe
from frappe.model.document import Document


class ServiceCallCustom(Document):
    pass


# 🔥 Dropdown Query
@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_service_no(doctype, txt, searchfield, start, page_len, filters):

    return frappe.db.sql("""
        SELECT 
            name AS value,
            CONCAT(service_no, ' | ', item_code, ' | ', location) AS description
        FROM `tabSales Order Installed Asset`
        WHERE service_no LIKE %(txt)s
        LIMIT %(start)s, %(page_len)s
    """, {
        "txt": f"%{txt}%",
        "start": start,
        "page_len": page_len
    })


# 🔥 Get Service Details
@frappe.whitelist()
def get_service_details(service_no):

    asset = frappe.get_doc("Sales Order Installed Asset", service_no)

    assets = frappe.get_all(
        "Sales Order Installed Asset",
        filters={"service_no": asset.service_no},
        fields=[
            "item_code",
            "service_no as serial_no",  # ✅ FIXED
            "location",
            "start_date",
            "parent",
            "service_no"
        ]
    )

    if not assets:
        return {}

    customer = frappe.db.get_value("Sales Order", assets[0].parent, "customer")

    return {
        "customer": customer,
        "service_no_display": assets[0].service_no,
        "location": assets[0].location,
        "schedule_date": assets[0].start_date,
        "items": assets
    }

    # 🔥 Step 1: Selected record lo
    asset = frappe.get_doc("Sales Order Installed Asset", service_no)

    # 🔥 Step 2: uska service_no nikalo
    service_no_value = asset.service_no

    # 🔥 Step 3: SAME service_no ke sab records lao
    assets = frappe.get_all(
        "Sales Order Installed Asset",
        filters={"service_no": service_no_value},
        fields=[
            "item_code",
            "name as serial_no",
            "serial_no",
            "location",
            "start_date",
            "parent",
            "service_no"
        ]
    )

    if not assets:
        return {}

    # 🔥 Customer
    customer = frappe.db.get_value("Sales Order", assets[0].parent, "customer")

    return {
        "customer": customer,
        "service_no_display": service_no_value,
        "location": assets[0].location,
        "schedule_date": assets[0].start_date,
        "items": assets
    }

    # 🔥 Pehle selected record se service_no nikalo
    asset = frappe.get_doc("Sales Order Installed Asset", service_no)

    assets = frappe.get_all(
        "Sales Order Installed Asset",
        filters={"service_no": asset.service_no},
        fields=[
            "item_code",
            "name as serial_no",
            "location",
            "start_date",
            "parent",
            "service_no"
        ]
    )

    if not assets:
        return {}

    customer = frappe.db.get_value("Sales Order", assets[0].parent, "customer")

    return {
        "customer": customer,
        "service_no_display": assets[0].service_no,
        "location": assets[0].location,
        "schedule_date": assets[0].start_date,
        "items": assets
    }

    # 🔥 Single record fetch (Link field ke liye)
    asset = frappe.get_doc("Sales Order Installed Asset", service_no)

    customer = frappe.db.get_value("Sales Order", asset.parent, "customer")

    return {
        "customer": customer,
        "service_no_display": asset.service_no,
        "location": asset.location,
        "schedule_date": asset.start_date,
        "items": [
            {
                "item_code": asset.item_code,
                "serial_no": asset.name
            }
        ]
    }