import frappe

def get_customer_visit_permission_query(user):
    frappe.throw("Permission Query Triggered")
    if not user:
        user = frappe.session.user

    user_roles = frappe.get_roles(user)

    # System Manager sees everything
    if "System Manager" in user_roles:
        return ""

    employee = frappe.db.get_value("Employee", {"user_id": user}, "name")

    # Manager logic
    if "Customer Visit Manager" in user_roles:
        visible_users = [user]

        if employee:
            reportees = frappe.db.get_all(
                "Employee",
                filters={"reports_to": employee},
                pluck="user_id"
            )

            for u in reportees:
                if u:
                    visible_users.append(u)

        visible_users = list(set(visible_users))

        user_list = ", ".join([frappe.db.escape(u) for u in visible_users])

        return f"`tabCustomer Visit Report`.`visited_by` IN ({user_list})"

    # Normal User
    return f"`tabCustomer Visit Report`.`visited_by` = {frappe.db.escape(user)}"