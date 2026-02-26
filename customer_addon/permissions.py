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
        if employee:
            # Get all employees who report to this manager
            reportee_employees = frappe.db.get_all(
                "Employee",
                filters={"reports_to": employee},
                fields=["user_id"]
            )

            # Collect visible user IDs: own + reportees
            visible_users = [user]
            for emp in reportee_employees:
                if emp.user_id:
                    visible_users.append(emp.user_id)

            # Build IN clause without extra quoting
            user_list = ", ".join([f"'{u}'" for u in visible_users])
            return f"`tabCustomer Visit Report`.`visited_by` IN ({user_list})"
        else:
            return f"`tabCustomer Visit Report`.`visited_by` = '{user}'"

    # Customer Visit User — own entries only
    return f"`tabCustomer Visit Report`.`visited_by` = '{user}'"