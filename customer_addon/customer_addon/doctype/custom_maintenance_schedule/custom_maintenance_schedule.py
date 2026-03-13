import frappe
from frappe.model.document import Document
from frappe.utils import add_days, add_months


class CustomMaintenanceSchedule(Document):

    def validate(self):
        if not self.status:
            self.status = "Draft"

    def on_submit(self):
        self.status = "Submitted"

    def on_cancel(self):
        self.status = "Cancelled"


    @frappe.whitelist()
    def generate_schedule(self):

        # clear old schedule
        self.set("schedules", [])

        item_counter = 1

        for item in self.items:

            if not item.start_date or not item.no_of_visits:
                continue

            visit_date = item.start_date
            service_no = f"SrNo{str(item_counter).zfill(3)}"

            for i in range(item.no_of_visits):

                row = self.append("schedules", {})

                row.service_no = service_no
                row.item_code = item.item_code
                row.description = item.description
                row.location = item.custom_location
                row.serial_no = item.serial_no
                row.sales_order = item.sales_order
                row.start_date = visit_date

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

                row.end_date = next_date
                visit_date = next_date

            item_counter += 1

        frappe.msgprint("Maintenance Schedule Generated Successfully")


@frappe.whitelist()
def get_installed_items(sales_order):

    return frappe.get_all(
        "Sales Order Installed Asset",
        filters={"parent": sales_order},
        fields=[
            "item_code",
            "model",
            "capacity",
            "location",
            "start_date",
            "end_date"
        ]
    )

# import frappe
# from frappe.model.document import Document

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
#         frappe.msgprint("Generate Schedule method connected. Logic will be implemented next.")

#     @frappe.whitelist()
#     def get_installed_items(sales_order):

#         items = frappe.get_all(
#             "Sales Order Item",
#             filters={
#                 "parent": sales_order
#             },
#             fields=[
#                 "item_code",
#                 "item_name",
#                 "qty"
#             ]
#         )

#         return items
