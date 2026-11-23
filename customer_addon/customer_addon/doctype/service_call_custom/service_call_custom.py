# import frappe
# from frappe.model.document import Document


# class ServiceCallCustom(Document):

#     # ==========================================================
#     # ON SUBMIT
#     # ==========================================================

#     def on_submit(self):
#         self.create_stock_entries()

#     # ==========================================================
#     # CREATE OUTWARD / INWARD STOCK ENTRIES
#     # ==========================================================

#     def create_stock_entries(self):

#         # OUTWARD (Material Issue)
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

#             if issue_entry.get("items"):
#                 issue_entry.insert(ignore_permissions=True)
#                 issue_entry.submit()

#                 frappe.msgprint(
#                     f"Outward Stock Entry: {issue_entry.name}"
#                 )

#         # INWARD (Material Receipt)
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

#             if receipt_entry.get("items"):
#                 receipt_entry.insert(ignore_permissions=True)
#                 receipt_entry.submit()

#                 frappe.msgprint(
#                     f"Inward Stock Entry: {receipt_entry.name}"
#                 )


# # # ==========================================================
# # # SEARCH SERVICE NUMBERS
# # # ==========================================================

# # @frappe.whitelist()
# # def search_service_numbers(txt="", start=0, page_len=50):

# #     txt = (txt or "").strip()

# #     start = int(start or 0)
# #     page_len = min(int(page_len or 50), 100)

# #     results = frappe.db.sql("""
# #         SELECT
# #             sia.service_no,
# #             cms.customer,
# #             GROUP_CONCAT(
# #                 DISTINCT sia.location
# #                 ORDER BY sia.location
# #                 SEPARATOR ', '
# #             ) AS location

# #         FROM `tabSales Order Installed Asset` sia

# #         LEFT JOIN `tabCustom Maintenance Schedule` cms
# #             ON cms.name = sia.parent
# #             AND sia.parenttype = 'Custom Maintenance Schedule'

# #         WHERE
# #             IFNULL(sia.service_no, '') != ''
# #             AND sia.service_no LIKE %(txt)s

# #         GROUP BY
# #             sia.service_no,
# #             cms.customer

# #         ORDER BY sia.service_no DESC

# #         LIMIT %(start)s, %(page_len)s

# #     """, {
# #         # "txt": f"%{txt}%",
# #         "txt": f"{txt}%",
# #         "start": start,
# #         "page_len": page_len
# #     }, as_dict=True)

# #     return results



# @frappe.whitelist()
# def search_service_numbers(txt="", start=0, page_len=50):

#     txt = (txt or "").strip()

#     start = int(start or 0)
#     page_len = min(int(page_len or 50), 100)

#     is_numeric = txt.isdigit()

#     results = frappe.db.sql("""
#         SELECT
#             sia.service_no,
#             cms.customer,
#             GROUP_CONCAT(
#                 DISTINCT sia.location
#                 ORDER BY sia.location
#                 SEPARATOR ', '
#             ) AS location

#         FROM `tabSales Order Installed Asset` sia

#         LEFT JOIN `tabCustom Maintenance Schedule` cms
#             ON cms.name = sia.parent
#             AND sia.parenttype = 'Custom Maintenance Schedule'

#         WHERE
#             IFNULL(sia.service_no, '') != ''
#             AND (
#                 sia.service_no LIKE %(txt)s

#                 OR (
#                     %(is_numeric)s = 1
#                     AND RIGHT(
#                         sia.service_no,
#                         CHAR_LENGTH(%(txt)s)
#                     ) = %(txt)s
#                 )
#             )

#         GROUP BY
#             sia.service_no,
#             cms.customer

#         ORDER BY sia.service_no DESC

#         LIMIT %(start)s, %(page_len)s

#     """, {
#         "txt": f"{txt}%",
#         "is_numeric": 1 if is_numeric else 0,
#         "start": start,
#         "page_len": page_len
#     }, as_dict=True)

#     return results



# # ==========================================================
# # GET SERVICE DETAILS USING ACTUAL SERVICE NUMBER
# # ==========================================================

# @frappe.whitelist()
# def get_service_details(service_no):

#     if not service_no:
#         return {}

#     print("\n========== SERVICE DETAILS FETCH ==========")
#     print("Selected Service No:", service_no)

#     # ------------------------------------------------------
#     # FETCH ALL MATCHING SALES ORDER INSTALLED ASSET ROWS
#     # ------------------------------------------------------

#     asset_meta = frappe.get_meta("Sales Order Installed Asset")

#     fields = [
#         "name",
#         "item_code",
#         "service_no",
#         "location",
#         "sub_location",
#         "address",
#         "item_group",
#         "model",
#         "type",
#         "capacity",
#         "amc",
#         "start_date",
#         "end_date",
#         "warrenty",
#         "warranty_date",
#         "parent",
#         "parenttype"
#     ]

#     # Fetch description only if the source DocType has this field
#     if asset_meta.has_field("description"):
#         fields.append("description")

#     # # Fetch only fields available in the source DocType
#     # fields = [
#     #     field for field in fields
#     #     if field == "name" or asset_meta.has_field(field)
#     # ]

#     fields = [
#         field for field in fields
#         if field in ("name", "parent", "parenttype", "parentfield")
#         or asset_meta.has_field(field)
#     ]

#     assets = frappe.get_all(
#         "Sales Order Installed Asset",
#         filters={
#             "service_no": service_no
#         },
#         fields=fields,
#         order_by="start_date asc"
#     )

#     if not assets:
#         frappe.throw(
#             f"No Sales Order Installed Asset found for {service_no}"
#         )

#     # ------------------------------------------------------
#     # CHECK PARENT CONSISTENCY
#     # ------------------------------------------------------

#     parents = list(set(
#         (row.parenttype, row.parent)
#         for row in assets
#         if row.parent and row.parenttype
#     ))

#     print("DEBUG SERVICE NO:", service_no)
#     print("DEBUG ASSETS:", assets)
#     print("DEBUG UNIQUE PARENTS:", parents)
#     print("DEBUG PARENT COUNT:", len(parents))

#     if len(parents) != 1:
#         frappe.throw(
#             f"Service No {service_no} belongs to multiple "
#             "Maintenance Schedules or has invalid parent mapping. "
#             "Please verify the Service No."
#         )

#     parenttype, parent = parents[0]

#     print("Parent Type:", parenttype)
#     print("Parent Document:", parent)

#     # ------------------------------------------------------
#     # FETCH CUSTOMER FROM PARENT SCHEDULE
#     # ------------------------------------------------------

#     customer = None

#     if frappe.get_meta(parenttype).has_field("customer"):

#         customer = frappe.db.get_value(
#             parenttype,
#             parent,
#             "customer"
#         )

#     print("Customer Found:", customer)

#     # ------------------------------------------------------
#     # PREPARE SERVICE CALL CHILD TABLE ITEMS
#     # ------------------------------------------------------

#     items = []

#     for asset in assets:

#         if not asset.item_code:
#             continue

#         # ----------------------------------------------
#         # FETCH SUB LOCATION
#         # Customer Location.description
#         # ----------------------------------------------

#         sub_location = ""

#         if asset.location:

#             sub_location = frappe.db.get_value(
#                 "Customer Location",
#                 asset.location,
#                 "description"
#             ) or ""

#         # ----------------------------------------------
#         # FETCH ADDRESS
#         # Customer Installed Asset.address
#         # ----------------------------------------------

#         address = ""

#         if customer and asset.item_code and asset.location:

#             address = frappe.db.get_value(
#                 "Customer Installed Asset",
#                 {
#                     "parent": customer,
#                     "parenttype": "Customer",
#                     "parentfield": "custom_customer_installed_assets",
#                     "custom_item_code": asset.item_code,
#                     "location": asset.location
#                 },
#                 "address"
#             ) or ""

#         # ----------------------------------------------
#         # FETCH ITEM DESCRIPTION
#         # ----------------------------------------------

#         description = (
#             asset.get("description")
#             or frappe.db.get_value(
#                 "Item",
#                 asset.item_code,
#                 "description"
#             )
#             or ""
#         )

#         # ----------------------------------------------
#         # APPEND CHILD TABLE ROW
#         # ----------------------------------------------

#         items.append({

#             "item_code": asset.item_code,

#             # Actual Service No stored in serial_no
#             "serial_no": asset.service_no,

#             "description": description,

#             "start_date": asset.start_date,

#             "location": asset.location,

#             "sub_location": sub_location,

#             "address": address,

#             "item_group": asset.get("item_group"),

#             "model": asset.get("model"),

#             "type": asset.get("type"),

#             "capacity": asset.get("capacity"),

#             "amc": asset.get("amc"),

#             "end_date": asset.get("end_date"),

#             # Source: warrenty
#             # Target: warranty
#             "warranty": asset.get("warrenty"),

#             "warranty_date": asset.get("warranty_date")
#         })

#     # ------------------------------------------------------
#     # PARENT LOCATION
#     # ------------------------------------------------------

#     location = assets[0].location

#     # ------------------------------------------------------
#     # FINAL RESPONSE
#     # ------------------------------------------------------

#     result = {
#         "service_no": service_no,
#         "customer": customer,
#         "location": location,
#         "items": items
#     }

#     print("Total Matching Items:", len(items))
#     print("========== SERVICE DETAILS COMPLETED ==========\n")

#     return result





import frappe
from frappe.model.document import Document


class ServiceCallCustom(Document):

    # ==========================================================
    # ON SUBMIT
    # ==========================================================

    def on_submit(self):
        self.create_stock_entries()

    # ==========================================================
    # CREATE OUTWARD / INWARD STOCK ENTRIES
    # ==========================================================

    def create_stock_entries(self):

        # OUTWARD (Material Issue)
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

            if issue_entry.get("items"):
                issue_entry.insert(ignore_permissions=True)
                issue_entry.submit()

                frappe.msgprint(
                    f"Outward Stock Entry: {issue_entry.name}"
                )

        # INWARD (Material Receipt)
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

            if receipt_entry.get("items"):
                receipt_entry.insert(ignore_permissions=True)
                receipt_entry.submit()

                frappe.msgprint(
                    f"Inward Stock Entry: {receipt_entry.name}"
                )


# ==========================================================
# SEARCH SERVICE NUMBERS
# Supports full Service No and numeric suffix search
# ==========================================================

@frappe.whitelist()
def search_service_numbers(txt="", start=0, page_len=50):

    txt = (txt or "").strip()

    start = int(start or 0)
    page_len = min(int(page_len or 50), 100)

    is_numeric = txt.isdigit()

    results = frappe.db.sql("""
        SELECT
            sia.service_no,
            cms.customer,
            GROUP_CONCAT(
                DISTINCT sia.location
                ORDER BY sia.location
                SEPARATOR ', '
            ) AS location

        FROM `tabSales Order Installed Asset` sia

        LEFT JOIN `tabCustom Maintenance Schedule` cms
            ON cms.name = sia.parent
            AND sia.parenttype = 'Custom Maintenance Schedule'

        WHERE
            IFNULL(sia.service_no, '') != ''
            AND (
                sia.service_no LIKE %(txt)s

                OR (
                    %(is_numeric)s = 1
                    AND RIGHT(
                        sia.service_no,
                        CHAR_LENGTH(%(numeric_txt)s)
                    ) = %(numeric_txt)s
                )
            )

        GROUP BY
            sia.service_no,
            cms.customer

        ORDER BY sia.service_no DESC

        LIMIT %(start)s, %(page_len)s

    """, {
        "txt": f"{txt}%",
        "numeric_txt": txt,
        "is_numeric": 1 if is_numeric else 0,
        "start": start,
        "page_len": page_len
    }, as_dict=True)

    return results


# ==========================================================
# GET SERVICE DETAILS USING ACTUAL SERVICE NUMBER
# ==========================================================

@frappe.whitelist()
def get_service_details(service_no):

    if not service_no:
        return {}

    print("\n========== SERVICE DETAILS FETCH ==========")
    print("Selected Service No:", service_no)

    # ------------------------------------------------------
    # FETCH ALL MATCHING SALES ORDER INSTALLED ASSET ROWS
    # ------------------------------------------------------

    asset_meta = frappe.get_meta("Sales Order Installed Asset")

    fields = [
        "name",
        "item_code",
        "service_no",
        "location",
        "sub_location",
        "address",
        "item_group",
        "model",
        "type",
        "capacity",
        "amc",
        "start_date",
        "end_date",
        "warrenty",
        "warranty_date",
        "parent",
        "parenttype"
    ]

    # Fetch description only if the source DocType has this field
    if asset_meta.has_field("description"):
        fields.append("description")

    # Fetch only fields available in the source DocType
    fields = [
        field for field in fields
        if field in ("name", "parent", "parenttype", "parentfield")
        or asset_meta.has_field(field)
    ]

    assets = frappe.get_all(
        "Sales Order Installed Asset",
        filters={
            "service_no": service_no
        },
        fields=fields,
        order_by="start_date asc"
    )

    if not assets:
        frappe.throw(
            f"No Sales Order Installed Asset found for {service_no}"
        )

    # ------------------------------------------------------
    # CHECK PARENT CONSISTENCY
    # ------------------------------------------------------

    parents = list(set(
        (row.parenttype, row.parent)
        for row in assets
        if row.parent and row.parenttype
    ))

    print("DEBUG SERVICE NO:", service_no)
    print("DEBUG ASSETS:", assets)
    print("DEBUG UNIQUE PARENTS:", parents)
    print("DEBUG PARENT COUNT:", len(parents))

    if len(parents) != 1:
        frappe.throw(
            f"Service No {service_no} belongs to multiple "
            "Maintenance Schedules or has invalid parent mapping. "
            "Please verify the Service No."
        )

    parenttype, parent = parents[0]

    print("Parent Type:", parenttype)
    print("Parent Document:", parent)

    # ------------------------------------------------------
    # FETCH CUSTOMER FROM PARENT SCHEDULE
    # ------------------------------------------------------

    customer = None

    if frappe.get_meta(parenttype).has_field("customer"):

        customer = frappe.db.get_value(
            parenttype,
            parent,
            "customer"
        )

    print("Customer Found:", customer)

    # ------------------------------------------------------
    # PREPARE SERVICE CALL CHILD TABLE ITEMS
    # ------------------------------------------------------

    items = []

    for asset in assets:

        if not asset.item_code:
            continue

        # ----------------------------------------------
        # FETCH SUB LOCATION
        # Customer Location.description
        # ----------------------------------------------

        sub_location = ""

        if asset.location:

            sub_location = frappe.db.get_value(
                "Customer Location",
                asset.location,
                "description"
            ) or ""

        # ----------------------------------------------
        # FETCH ADDRESS
        # Customer Installed Asset.address
        # ----------------------------------------------

        address = ""

        if customer and asset.item_code and asset.location:

            address = frappe.db.get_value(
                "Customer Installed Asset",
                {
                    "parent": customer,
                    "parenttype": "Customer",
                    "parentfield": "custom_customer_installed_assets",
                    "custom_item_code": asset.item_code,
                    "location": asset.location
                },
                "address"
            ) or ""

        # ----------------------------------------------
        # FETCH ITEM DESCRIPTION
        # ----------------------------------------------

        description = (
            asset.get("description")
            or frappe.db.get_value(
                "Item",
                asset.item_code,
                "description"
            )
            or ""
        )

        # ----------------------------------------------
        # APPEND CHILD TABLE ROW
        # ----------------------------------------------

        items.append({

            "item_code": asset.item_code,

            # Actual Service No stored in serial_no
            "serial_no": asset.service_no,

            "description": description,

            "start_date": asset.start_date,

            "location": asset.location,

            "sub_location": sub_location,

            "address": address,

            "item_group": asset.get("item_group"),

            "model": asset.get("model"),

            "type": asset.get("type"),

            "capacity": asset.get("capacity"),

            "amc": asset.get("amc"),

            "end_date": asset.get("end_date"),

            # Source: warrenty
            # Target: warranty
            "warranty": asset.get("warrenty"),

            "warranty_date": asset.get("warranty_date")
        })

    # ------------------------------------------------------
    # PARENT LOCATION
    # ------------------------------------------------------

    location = assets[0].location

    # ------------------------------------------------------
    # FINAL RESPONSE
    # ------------------------------------------------------

    result = {
        "service_no": service_no,
        "customer": customer,
        "location": location,
        "items": items
    }

    print("Total Matching Items:", len(items))
    print("========== SERVICE DETAILS COMPLETED ==========\n")

    return result
