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

        for location, items in location_items.items():

            location_code = frappe.scrub(location).replace("_", "").upper()[:3]

            visit_map = {}

            for item in items:

                if not item.start_date or not item.no_of_visits:
                    continue

                visit_date = item.start_date

                for i in range(item.no_of_visits):

                    # 🔁 calculate next_date
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

            # 🔥 SR per DATE (NOT per item)
            for visit_date, visit_items in visit_map.items():

                service_no = make_autoname(f"SR-{location_code}-.####")

                for d in visit_items:

                    item = d["item"]

                    row = self.append("schedules", {})

                    row.service_no = service_no
                    row.customer = customer
                    row.item_code = item.item_code
                    row.description = item.description
                    row.location = location
                    row.serial_no = item.serial_no
                    row.sales_order = item.sales_order
                    row.start_date = d["date"]
                    row.end_date = d["end_date"]
                    row.visit_no = d["visit_no"]

        frappe.msgprint("✅ SR Generated (Date-wise, Location Based)")


        
# import frappe
# from frappe.model.document import Document
# from frappe.utils import add_days, add_months
# from frappe.model.naming import make_autoname


# class CustomMaintenanceSchedule(Document):

#     def validate(self):
#         if not self.status:
#             self.status = "Draft"

#     def on_submit(self):
#         self.status = "Submitted"

#     def on_cancel(self):
#         self.status = "Cancelled"

#     @frappe.whitelist()
#     def generate_schedule(self):

#         # 🔥 clear old schedule
#         self.set("schedules", [])
#                 # 🔥 GET CUSTOMER FROM PARENT
#         customer = self.customer


#         # 🔥 group items by location
#         location_items = {}

#         for item in self.items:
#             location = item.custom_location or "DEFAULT"
#             location_items.setdefault(location, []).append(item)

#         # 🔥 process each location separately
#         for location, items in location_items.items():

#             # ✅ ONE SR PER LOCATION
#             service_no = make_autoname("SR-.####")

#             for item in items:

#                 if not item.start_date or not item.no_of_visits:
#                     continue

#                 visit_date = item.start_date

#                 for i in range(item.no_of_visits):

#                     row = self.append("schedules", {})

#                     # ✅ SAME SR for whole location
#                     row.service_no = service_no
#                                         # 🔥 ADD CUSTOMER HERE
#                     row.customer = customer


#                     row.item_code = item.item_code
#                     row.description = item.description
#                     row.location = location
#                     row.serial_no = item.serial_no
#                     row.sales_order = item.sales_order
#                     row.start_date = visit_date
#                     row.visit_no = i + 1

#                     # 🔁 Periodicity logic
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

#                     row.end_date = next_date

#                     # 🔁 move to next visit
#                     visit_date = next_date

#         frappe.msgprint("✅ Location-wise Service Schedule Generated (1 SR per Location)")



    

    # @frappe.whitelist()
    # def generate_schedule(self):

    #     # 🔥 clear old schedule
    #     self.set("schedules", [])

    #     # 🔥 group items by location
    #     location_items = {}

    #     for item in self.items:
    #         location = item.custom_location or "DEFAULT"
    #         location_items.setdefault(location, []).append(item)

    #     # 🔥 process each location separately
    #     for location, items in location_items.items():

    #         for item in items:

    #             if not item.start_date or not item.no_of_visits:
    #                 continue

    #             visit_date = item.start_date

    #             for i in range(item.no_of_visits):

    #                 # ✅ GLOBAL UNIQUE SR (continuous)
    #                 service_no = make_autoname("SR-.####")

    #                 row = self.append("schedules", {})

    #                 row.service_no = service_no
    #                 row.item_code = item.item_code
    #                 row.description = item.description
    #                 row.location = location
    #                 row.serial_no = item.serial_no
    #                 row.sales_order = item.sales_order
    #                 row.start_date = visit_date
    #                 row.visit_no = i + 1

    #                 # 🔁 Periodicity
    #                 if item.periodicity == "Weekly":
    #                     next_date = add_days(visit_date, 7)

    #                 elif item.periodicity == "Monthly":
    #                     next_date = add_months(visit_date, 1)

    #                 elif item.periodicity == "Quarterly":
    #                     next_date = add_months(visit_date, 3)

    #                 elif item.periodicity == "Half Yearly":
    #                     next_date = add_months(visit_date, 6)

    #                 elif item.periodicity == "Yearly":
    #                     next_date = add_months(visit_date, 12)

    #                 else:
    #                     next_date = visit_date

    #                 row.end_date = next_date
    #                 visit_date = next_date

    #     frappe.msgprint("✅ Location-wise Visit Schedule Generated")



