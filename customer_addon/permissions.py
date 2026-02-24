import frappe

def get_customer_visit_permission_query(user):
    if not user:
        user = frappe.session.user

    # System Manager and Customer Visit Manager can see ALL entries
    user_roles = frappe.get_roles(user)
    if "System Manager" in user_roles or "Customer Visit Manager" in user_roles:
        return ""  # No filter = sees everything

    # Regular Customer Visit User sees only their own entries
    return f"`tabCustomer Visit Report`.`visited_by` = '{frappe.db.escape(user)}'"