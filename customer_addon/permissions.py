import frappe

def get_customer_visit_permission_query(user):
    if not user:
        user = frappe.session.user

    user_roles = frappe.get_roles(user)

    # System Manager sees everything
    if "System Manager" in user_roles:
        return ""

    # Get the Employee record linked to this user
    employee = frappe.db.get_value("Employee", {"user_id": user}, "name")

    if "Customer Visit Manager" in user_roles:
        # Manager sees:
        # 1. Their own entries (visited_by = current user)
        # 2. Entries of employees whose reports_to = this manager's Employee record

        if employee:
            # Get all users who report to this manager
            reportee_employees = frappe.db.get_all(
                "Employee",
                filters={"reports_to": employee},
                fields=["user_id"]
            )

            # Collect all visible user IDs: own + reportees
            visible_users = [user]
            for emp in reportee_employees:
                if emp.user_id:
                    visible_users.append(emp.user_id)

            # Build safe SQL IN clause
            user_list = ", ".join([f"'{frappe.db.escape(u)}'" for u in visible_users])
            return f"`tabCustomer Visit Report`.`visited_by` IN ({user_list})"
        else:
            # Manager has no Employee record, show only their own entries
            return f"`tabCustomer Visit Report`.`visited_by` = '{frappe.db.escape(user)}'"

    # Default: Customer Visit User sees only their own entries
    return f"`tabCustomer Visit Report`.`visited_by` = '{frappe.db.escape(user)}'"