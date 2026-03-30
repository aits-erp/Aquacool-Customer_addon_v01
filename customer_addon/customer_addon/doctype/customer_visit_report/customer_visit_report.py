import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime
import json
import requests


def get_address_from_coordinates(lat, lon):
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"

        headers = {
            "User-Agent": "frappe-app"
        }

        response = requests.get(url, headers=headers, timeout=5)

        if response.status_code == 200:
            data = response.json()
            return data.get("display_name", "")
        else:
            return ""

    except Exception as e:
        frappe.log_error(f"Reverse Geocoding Error: {str(e)}")
        return ""


class CustomerVisitReport(Document):

    def validate(self):
        self.set_user()
        self.validate_check_flow()
        self.validate_location()
        self.set_location_name()   # 🔥 auto address set

    # ✅ Auto set logged-in user
    def set_user(self):
        if not self.visited_by:
            self.visited_by = frappe.session.user

    # ✅ Check-in / Check-out validation
    def validate_check_flow(self):

        if self.check_out_date_and_time and not self.check_in_date_and_time:
            frappe.throw("❌ Cannot Checkout without Checkin.")

        if self.check_out_date_and_time and self.check_in_date_and_time:
            if self.check_out_date_and_time < self.check_in_date_and_time:
                frappe.throw("❌ Checkout time cannot be before Checkin time.")

    # ✅ Location validation (GeoJSON + lat/lng match)
    def validate_location(self):

        if self.location:
            try:
                geo = json.loads(self.location)
                coords = geo["features"][0]["geometry"]["coordinates"]

                stored_lon = float(coords[0])
                stored_lat = float(coords[1])

                if round(stored_lat, 6) != round(float(self.latitude), 6) or \
                   round(stored_lon, 6) != round(float(self.longitude), 6):
                    frappe.throw("❌ Location data mismatch detected.")

            except Exception:
                frappe.throw("❌ Invalid location data format.")

    # ✅ Address auto fetch and set
    def set_location_name(self):

        if self.latitude and self.longitude:
            address = get_address_from_coordinates(self.latitude, self.longitude)

            if address:
                self.location_name = address
            else:
                self.location_name = "Address not found"

    # ✅ Prevent submit without check-in/out
    def before_submit(self):

        if not self.check_in_date_and_time:
            frappe.throw("❌ Cannot submit without Check-In.")

        if not self.check_out_date_and_time:
            frappe.throw("❌ Cannot submit without Check-Out.")



# import frappe
# from frappe.model.document import Document
# from frappe.utils import now_datetime
# import json

# class CustomerVisitReport(Document):

#     def validate(self):
#         self.set_user()
#         self.validate_check_flow()
#         self.validate_location()

#     def validate_location(self):
#         if self.location:
#             try:
#                 geo = json.loads(self.location)
#                 coords = geo["features"][0]["geometry"]["coordinates"]

#                 stored_lon = float(coords[0])
#                 stored_lat = float(coords[1])

#                 if round(stored_lat, 6) != round(float(self.latitude), 6) or \
#                 round(stored_lon, 6) != round(float(self.longitude), 6):
#                     frappe.throw("Location data mismatch detected.")

#             except Exception:
#                 frappe.throw("Invalid location data format.")

#     def before_submit(self):
#         if not self.check_in_date_and_time:
#             frappe.throw("Cannot submit without Check-In.")

#         if not self.check_out_date_and_time:
#             frappe.throw("Cannot submit without Check-Out.")

#     def set_user(self):
#         if not self.visited_by:
#             self.visited_by = frappe.session.user

#     def validate_check_flow(self):

#         if self.check_out_date_and_time and not self.check_in_date_and_time:
#             frappe.throw("Cannot Checkout without Checkin.")

#         if self.check_out_date_and_time and self.check_in_date_and_time:
#             if self.check_out_date_and_time < self.check_in_date_and_time:
#                 frappe.throw("Checkout time cannot be before Checkin time.")