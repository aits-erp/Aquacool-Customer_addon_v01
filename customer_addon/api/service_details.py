import frappe

@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_service_no(doctype, txt, searchfield, start, page_len, filters):

    return frappe.db.sql("""
        SELECT DISTINCT service_no
        FROM `tabSales Order Installed Asset`
        WHERE service_no LIKE %(txt)s
        LIMIT %(start)s, %(page_len)s
    """, {
        "txt": "%%%{}%%".format(txt),
        "start": start,
        "page_len": page_len
    })