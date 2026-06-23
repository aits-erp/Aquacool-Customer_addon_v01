# # Copyright (c) 2026, aits and contributors
# # For license information, please see license.txt


import frappe
from frappe.utils import get_url_to_list


def execute(filters=None):
    filters = filters or {}

    columns = get_columns()
    data = get_data(filters)

    return columns, data


def get_columns():
    return [
        {
            "label": "Date",
            "fieldname": "visit_date",
            "fieldtype": "Date",
            "width": 120,
        },
        {
            "label": "Employee Name",
            "fieldname": "employee",
            "fieldtype": "Link",
            "options": "User",
            "width": 220,
        },
        {
            "label": "Total No of Visit Count",
            "fieldname": "visit_count",
            "fieldtype": "Int",
            "width": 180,
        },
    ]


def get_data(filters):
    conditions = ["docstatus < 2"]
    values = {}

    if filters.get("from_date"):
        conditions.append("DATE(visit_datetime) >= %(from_date)s")
        values["from_date"] = filters.get("from_date")

    if filters.get("to_date"):
        conditions.append("DATE(visit_datetime) <= %(to_date)s")
        values["to_date"] = filters.get("to_date")

    if filters.get("employee"):
        conditions.append("visited_by = %(employee)s")
        values["employee"] = filters.get("employee")

    where_clause = " AND ".join(conditions)

    data = frappe.db.sql(
        f"""
        SELECT
            DATE(visit_datetime) AS visit_date,
            visited_by AS employee,
            COUNT(name) AS visit_count
        FROM
            `tabCustomer Visit Report`
        WHERE
            {where_clause}
        GROUP BY
            DATE(visit_datetime), visited_by
        ORDER BY
            DATE(visit_datetime) DESC, visited_by
        """,
        values,
        as_dict=True,
    )

    return data