# import frappe
# from frappe.model.document import Document
# from frappe.utils import add_days, add_months
# from frappe.model.naming import make_autoname


# class CustomMaintenanceSchedule(Document):

#     @frappe.whitelist()
#     def generate_schedule(self):

#         self.set("schedules", [])

#         customer = self.customer

#         location_items = {}
#         for item in self.items:
#             location = item.custom_location or "DEFAULT"
#             location_items.setdefault(location, []).append(item)

#         for location, items in location_items.items():

#             location_code = frappe.scrub(location).replace("_", "").upper()[:3]

#             visit_map = {}

#             for item in items:

#                 if not item.start_date or not item.no_of_visits:
#                     continue

#                 visit_date = item.start_date

#                 for i in range(item.no_of_visits):

#                     # 🔁 calculate next_date
#                     if item.periodicity == "Weekly":
#                         next_date = add_days(visit_date, 7)
#                     elif item.periodicity == "Monthly":
#                         next_date = add_months(visit_date, 1)
#                     elif item.periodicity == "Quarterly":
#                         next_date = add_months(visit_date, 3)
#                     elif item.periodicity == "Half Yearly":
#                         next_date = add_months(visit_date, 6)
#                     elif item.periodicity == "Yearly":
#                         next_date = add_months(visit_date, 12)
#                     else:
#                         next_date = visit_date

#                     key = str(visit_date)

#                     visit_map.setdefault(key, []).append({
#                         "item": item,
#                         "visit_no": i + 1,
#                         "date": visit_date,
#                         "end_date": next_date
#                     })

#                     visit_date = next_date

#             # 🔥 SR per DATE (NOT per item)
#             for visit_date, visit_items in visit_map.items():

#                 service_no = make_autoname(f"SR-{location_code}-.####")

#                 for d in visit_items:

#                     item = d["item"]

#                     row = self.append("schedules", {})

#                     row.service_no = service_no
#                     row.customer = customer
#                     row.item_code = item.item_code
#                     row.description = item.description
#                     row.location = location
#                     row.serial_no = item.serial_no
#                     row.sales_order = item.sales_order
#                     row.start_date = d["date"]
#                     row.end_date = d["end_date"]
#                     row.visit_no = d["visit_no"]

#         frappe.msgprint("✅ SR Generated (Date-wise, Location Based)")


import frappe
from frappe.model.document import Document
from frappe.utils import add_days, add_months
from frappe.model.naming import make_autoname


class CustomMaintenanceSchedule(Document):

    @frappe.whitelist()
    def generate_schedule(self):

        self.set("schedules", [])

        customer = self.customer

        location_items = {}
        for item in self.items:
            location = item.custom_location or "DEFAULT"
            location_items.setdefault(location, []).append(item)

        # Cache original installed asset records
        asset_cache = {}

        # Get fields from the original Installed Asset DocType
        asset_fields = [
            df.fieldname
            for df in frappe.get_meta("Sales Order Installed Asset").fields
            if df.fieldname
        ]

        # Fields controlled by schedule generation
        skip_fields = {
            "name",
            "parent",
            "parentfield",
            "parenttype",
            "idx",
            "doctype",
            "owner",
            "creation",
            "modified",
            "modified_by",
            "docstatus",
            "service_no",
            "customer",
            "item_code",
            "description",
            "location",
            "sub_location",
            "serial_no",
            "sales_order",
            "start_date",
            "end_date",
            "visit_no"
        }

        for location, items in location_items.items():

            # Fetch Sub Location Address from Customer Location
            location_description = ""

            if location != "DEFAULT":
                location_description = frappe.db.get_value(
                    "Customer Location",
                    location,
                    "description"
                ) or ""

            location_code = frappe.scrub(location).replace("_", "").upper()[:3]

            visit_map = {}

            for item in items:

                if not item.start_date or not item.no_of_visits:
                    continue

                visit_date = item.start_date

                for i in range(item.no_of_visits):

                    # Calculate next_date
                    if item.periodicity == "Weekly":
                        next_date = add_days(visit_date, 7)

                    elif item.periodicity == "Monthly":
                        next_date = add_months(visit_date, 1)

                    elif item.periodicity == "Quarterly":
                        next_date = add_months(visit_date, 3)

                    elif item.periodicity == "Half Yearly":
                        next_date = add_months(visit_date, 6)

                    elif item.periodicity == "Yearly":
                        next_date = add_months(visit_date, 12)

                    else:
                        next_date = visit_date

                    key = str(visit_date)

                    visit_map.setdefault(key, []).append({
                        "item": item,
                        "visit_no": i + 1,
                        "date": visit_date,
                        "end_date": next_date
                    })

                    visit_date = next_date

            # SR per DATE (NOT per item)
            for visit_date, visit_items in visit_map.items():

                service_no = make_autoname(
                    f"SR-{location_code}-.####"
                )

                for d in visit_items:

                    item = d["item"]

                    row = self.append("schedules", {})

                    # Retrieve original Installed Asset
                    source_asset = None

                    if item.serial_no:

                        if item.serial_no not in asset_cache:

                            if frappe.db.exists(
                                "Sales Order Installed Asset",
                                item.serial_no
                            ):
                                asset_cache[item.serial_no] = frappe.get_doc(
                                    "Sales Order Installed Asset",
                                    item.serial_no
                                )
                            else:
                                asset_cache[item.serial_no] = None

                        source_asset = asset_cache[item.serial_no]

                    # Copy original installed asset fields
                    if source_asset:

                        for fieldname in asset_fields:

                            if fieldname in skip_fields:
                                continue

                            value = source_asset.get(fieldname)

                            if value is not None:
                                row.set(fieldname, value)

                    # Existing schedule mapping
                    row.service_no = service_no
                    row.customer = customer

                    row.item_code = (
                        item.item_code
                        or (source_asset.item_code if source_asset else None)
                    )

                    # row.description = (
                    #     item.description
                    #     or (source_asset.description if source_asset else None)
                    # )

                    row.description = (
                        item.get("description")
                        or frappe.db.get_value("Item", item.item_code, "description")
                        or ""
                    )

                    row.location = location

                    # Sub Location Address
                    row.sub_location = location_description

                    row.serial_no = item.serial_no
                    row.sales_order = item.sales_order

                    row.start_date = d["date"]
                    row.end_date = d["end_date"]
                    row.visit_no = d["visit_no"]

        frappe.msgprint(
            "SR Generated (Date-wise, Location Based)"
        )
