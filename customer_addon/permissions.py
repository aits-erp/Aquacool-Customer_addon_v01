import frappe

def get_customer_visit_permission_query(user):
    if user == "Administrator":
        return ""
    return f"`tabCustomer Visit Report`.visited_by = '{user}'"