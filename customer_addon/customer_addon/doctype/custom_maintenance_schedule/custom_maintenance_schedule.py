import frappe
from frappe.model.document import Document

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
        frappe.msgprint("Generate Schedule method connected. Logic will be implemented next.")
