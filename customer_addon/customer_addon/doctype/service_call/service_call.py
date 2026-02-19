import frappe
from frappe.model.document import Document

class ServiceCall(Document):

    def validate(self):
        if not self.status:
            self.status = "Draft"

    def on_submit(self):
        self.status = "Completed"

    def on_cancel(self):
        self.status = "Cancelled"
