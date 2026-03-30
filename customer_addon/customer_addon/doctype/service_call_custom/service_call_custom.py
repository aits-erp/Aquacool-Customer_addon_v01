import frappe
from frappe.model.document import Document
from frappe.utils import getdate, nowdate


class ServiceCallCustom(Document):

    def on_submit(self):
        self.create_stock_entries()

    def create_stock_entries(self):

        # 🔴 OUTWARD (Material Issue)
        if self.custom_product_outword:

            issue_entry = frappe.new_doc("Stock Entry")
            issue_entry.stock_entry_type = "Material Issue"

            for row in self.custom_product_outword:

                if not row.item or not row.qty:
                    continue

                if not row.source_warehouse:
                    frappe.throw("Source Warehouse required in Outward")

                issue_entry.append("items", {
                    "item_code": row.item,
                    "qty": row.qty,
                    "s_warehouse": row.source_warehouse
                })

            # ✅ SAFE SUBMIT
            if issue_entry.get("items"):
                issue_entry.insert(ignore_permissions=True)
                issue_entry.submit()
                frappe.msgprint(f"🔴 Outward Stock Entry: {issue_entry.name}")


        # 🟢 INWARD (Material Receipt)
        if self.custom_product_inword:

            receipt_entry = frappe.new_doc("Stock Entry")
            receipt_entry.stock_entry_type = "Material Receipt"

            for row in self.custom_product_inword:

                if not row.item or not row.qty:
                    continue

                if not row.target_warehouse:
                    frappe.throw("Target Warehouse required in Inward")

                receipt_entry.append("items", {
                    "item_code": row.item,
                    "qty": row.qty,
                    "t_warehouse": row.target_warehouse
                })

            # ✅ SAFE SUBMIT
            if receipt_entry.get("items"):
                receipt_entry.insert(ignore_permissions=True)
                receipt_entry.submit()
                frappe.msgprint(f"🟢 Inward Stock Entry: {receipt_entry.name}")


# 🔍 SERVICE NO DROPDOWN
@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_service_no(doctype, txt, searchfield, start, page_len, filters):

    return frappe.db.sql("""
        SELECT 
            name,
            CONCAT(service_no, ' | ', location) AS description
        FROM `tabSales Order Installed Asset`
        WHERE service_no LIKE %(txt)s
        ORDER BY service_no DESC
        LIMIT %(start)s, %(page_len)s
    """, {
        "txt": f"%{txt}%",
        "start": start,
        "page_len": page_len or 50
    })


# 🔥 GET SERVICE DETAILS (ONLY CUSTOMER FIXED)
@frappe.whitelist()
def get_service_details(service_no):

    if not service_no:
        return {}

    asset = frappe.get_doc("Sales Order Installed Asset", service_no)

    today = getdate(nowdate())

    start_of_month = today.replace(day=1)

    if today.month == 12:
        end_of_month = today.replace(year=today.year + 1, month=1, day=1)
    else:
        end_of_month = today.replace(month=today.month + 1, day=1)

    # 🔥 TRY CURRENT MONTH
    assets = frappe.get_all(
        "Sales Order Installed Asset",
        filters={
            "service_no": asset.service_no,
            "start_date": ["between", [start_of_month, end_of_month]]
        },
        fields=[
            "item_code",
            "service_no as serial_no",
            "location",
            "start_date",
            "parent",
            "parenttype",
            "service_no"
        ],
        order_by="start_date asc"
    )

    # 🔁 FALLBACK
    if not assets:
        assets = frappe.get_all(
            "Sales Order Installed Asset",
            filters={
                "service_no": asset.service_no
            },
            fields=[
                "item_code",
                "service_no as serial_no",
                "location",
                "start_date",
                "parent",
                "parenttype",
                "service_no"
            ],
            order_by="start_date asc",
            limit_page_length=1
        )

    if not assets:
        return {}

    # 🔥 CUSTOMER SAFE FETCH (MAIN FIX)
    customer = None

    if assets[0].parent and assets[0].parenttype:
        customer = frappe.db.get_value(
            assets[0].parenttype,   # 🔥 MOST IMPORTANT FIX
            assets[0].parent,
            "customer"
        )

    frappe.msgprint(f"Customer Found: {customer}")

    return {
        "customer": customer,
        "service_no_display": assets[0].service_no,
        "location": assets[0].location,
        "items": assets
    }

# import frappe
# from frappe.model.document import Document


# class ServiceCallCustom(Document):

#     def on_submit(self):
#         self.create_stock_entries()

#     def create_stock_entries(self):

#         # 🔴 OUTWARD (Material Issue)
#         if self.custom_product_outword:

#             issue_entry = frappe.new_doc("Stock Entry")
#             issue_entry.stock_entry_type = "Material Issue"

#             for row in self.custom_product_outword:

#                 if not row.item or not row.qty:
#                     continue

#                 if not row.source_warehouse:
#                     frappe.throw("Source Warehouse required in Outward")

#                 issue_entry.append("items", {
#                     "item_code": row.item,
#                     "qty": row.qty,
#                     "s_warehouse": row.source_warehouse
#                 })

#             issue_entry.insert(ignore_permissions=True)
#             issue_entry.submit()

#             frappe.msgprint(f"🔴 Outward Stock Entry: {issue_entry.name}")


#         # 🟢 INWARD (Material Receipt)
#         if self.custom_product_inword:

#             receipt_entry = frappe.new_doc("Stock Entry")
#             receipt_entry.stock_entry_type = "Material Receipt"

#             for row in self.custom_product_inword:

#                 if not row.item or not row.qty:
#                     continue

#                 if not row.target_warehouse:
#                     frappe.throw("Target Warehouse required in Inward")

#                 receipt_entry.append("items", {
#                     "item_code": row.item,
#                     "qty": row.qty,
#                     "t_warehouse": row.target_warehouse
#                 })

#             receipt_entry.insert(ignore_permissions=True)
#             receipt_entry.submit()

#             frappe.msgprint(f"🟢 Inward Stock Entry: {receipt_entry.name}")


# @frappe.whitelist()
# @frappe.validate_and_sanitize_search_inputs
# def get_service_no(doctype, txt, searchfield, start, page_len, filters):

#     return frappe.db.sql("""
#         SELECT 
#             name,   -- ✅ MUST BE name
#             CONCAT(service_no, ' | ', location) AS description
#         FROM `tabSales Order Installed Asset`
#         WHERE service_no LIKE %(txt)s
#         ORDER BY service_no DESC
#         LIMIT %(start)s, %(page_len)s
#     """, {
#         "txt": f"%{txt}%",
#         "start": start,
#         "page_len": page_len or 50
#     })


# # 🔥 FINAL CLEAN Get Service Details
# from frappe.utils import getdate, nowdate


# @frappe.whitelist()
# def get_service_details(service_no):

#     asset = frappe.get_doc("Sales Order Installed Asset", service_no)

#     today = getdate(nowdate())

#     start_of_month = today.replace(day=1)

#     if today.month == 12:
#         end_of_month = today.replace(year=today.year + 1, month=1, day=1)
#     else:
#         end_of_month = today.replace(month=today.month + 1, day=1)

#     # 🔥 TRY CURRENT MONTH
#     assets = frappe.get_all(
#         "Sales Order Installed Asset",
#         filters={
#             "service_no": asset.service_no,
#             "start_date": ["between", [start_of_month, end_of_month]]
#         },
#         fields=[
#             "item_code",
#             "service_no as serial_no",
#             "location",
#             "start_date",
#             "parent",
#             "service_no"
#         ],
#         order_by="start_date asc"
#     )

#     # 🔁 FALLBACK (IMPORTANT)
#     if not assets:
#         assets = frappe.get_all(
#             "Sales Order Installed Asset",
#             filters={
#                 "service_no": asset.service_no
#             },
#             fields=[
#                 "item_code",
#                 "service_no as serial_no",
#                 "location",
#                 "start_date",
#                 "parent",
#                 "service_no"
#             ],
#             order_by="start_date asc",
#             limit_page_length=1
#         )

#     if not assets:
#         return {}

#     customer = frappe.db.get_value("Sales Order", assets[0].parent, "customer")

#     return {
#         "customer": customer,
#         "service_no_display": assets[0].service_no,
#         "location": assets[0].location,
#         # "schedule_date": assets[0].get("start_date"),
#         "items": assets
#     }




# import frappe
# from frappe.model.document import Document


# class ServiceCallCustom(Document):
#     pass


# # 🔥 Dropdown Query
# @frappe.whitelist()
# @frappe.validate_and_sanitize_search_inputs
# def get_service_no(doctype, txt, searchfield, start, page_len, filters):

#     return frappe.db.sql("""
#         SELECT 
#             name AS value,
#             CONCAT(service_no, ' | ', item_code, ' | ', location) AS description
#         FROM `tabSales Order Installed Asset`
#         WHERE service_no LIKE %(txt)s
#         LIMIT %(start)s, %(page_len)s
#     """, {
#         "txt": f"%{txt}%",
#         "start": start,
#         "page_len": page_len
#     })


# # 🔥 Get Service Details
# @frappe.whitelist()
# def get_service_details(service_no):

#     asset = frappe.get_doc("Sales Order Installed Asset", service_no)

#     assets = frappe.get_all(
#         "Sales Order Installed Asset",
#         filters={"service_no": asset.service_no},
#         fields=[
#             "item_code",
#             "service_no as serial_no",  # ✅ FIXED
#             "location",
#             "start_date",
#             "parent",
#             "service_no"
#         ]
#     )

#     if not assets:
#         return {}

#     customer = frappe.db.get_value("Sales Order", assets[0].parent, "customer")

#     return {
#         "customer": customer,
#         "service_no_display": assets[0].service_no,
#         "location": assets[0].location,
#         "schedule_date": assets[0].start_date,
#         "items": assets
#     }

#     # 🔥 Step 1: Selected record lo
#     asset = frappe.get_doc("Sales Order Installed Asset", service_no)

#     # 🔥 Step 2: uska service_no nikalo
#     service_no_value = asset.service_no

#     # 🔥 Step 3: SAME service_no ke sab records lao
#     assets = frappe.get_all(
#         "Sales Order Installed Asset",
#         filters={"service_no": service_no_value},
#         fields=[
#             "item_code",
#             "name as serial_no",
#             "serial_no",
#             "location",
#             "start_date",
#             "parent",
#             "service_no"
#         ]
#     )

#     if not assets:
#         return {}

#     # 🔥 Customer
#     customer = frappe.db.get_value("Sales Order", assets[0].parent, "customer")

#     return {
#         "customer": customer,
#         "service_no_display": service_no_value,
#         "location": assets[0].location,
#         "schedule_date": assets[0].start_date,
#         "items": assets
#     }

#     # 🔥 Pehle selected record se service_no nikalo
#     asset = frappe.get_doc("Sales Order Installed Asset", service_no)

#     assets = frappe.get_all(
#         "Sales Order Installed Asset",
#         filters={"service_no": asset.service_no},
#         fields=[
#             "item_code",
#             "name as serial_no",
#             "location",
#             "start_date",
#             "parent",
#             "service_no"
#         ]
#     )

#     if not assets:
#         return {}

#     customer = frappe.db.get_value("Sales Order", assets[0].parent, "customer")

#     return {
#         "customer": customer,
#         "service_no_display": assets[0].service_no,
#         "location": assets[0].location,
#         "schedule_date": assets[0].start_date,
#         "items": assets
#     }

#     # 🔥 Single record fetch (Link field ke liye)
#     asset = frappe.get_doc("Sales Order Installed Asset", service_no)

#     customer = frappe.db.get_value("Sales Order", asset.parent, "customer")

#     return {
#         "customer": customer,
#         "service_no_display": asset.service_no,
#         "location": asset.location,
#         "schedule_date": asset.start_date,
#         "items": [
#             {
#                 "item_code": asset.item_code,
#                 "serial_no": asset.name
#             }
#         ]
#     }