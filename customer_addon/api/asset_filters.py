import frappe

@frappe.whitelist()
def get_sub_locations(location):
    if not location:
        return []

    return frappe.get_all(
        "Customer Sub Location",
        filters={"location": location},
        fields=["name", "sub_location_name", "sub_location_address"],
        order_by="sub_location_name"
    )


@frappe.whitelist()
def get_item_codes(custom_item_group):
    if not custom_item_group:
        return []

    return frappe.db.sql("""
        SELECT DISTINCT custom_item_code
        FROM `tabCustomer Asset Configuration`
        WHERE custom_item_group = %s
          AND is_active = 1
        ORDER BY custom_item_code
    """, (custom_item_group,), as_dict=True)


@frappe.whitelist()
def get_models(custom_item_group, custom_item_code):
    if not custom_item_group or not custom_item_code:
        return []

    return frappe.db.sql("""
        SELECT DISTINCT model
        FROM `tabCustomer Asset Configuration`
        WHERE custom_item_group = %s
          AND custom_item_code = %s
          AND is_active = 1
        ORDER BY model
    """, (custom_item_group, custom_item_code), as_dict=True)


@frappe.whitelist()
def get_types(custom_item_group, custom_item_code, model):
    if not custom_item_group or not custom_item_code or not model:
        return []

    return frappe.db.sql("""
        SELECT DISTINCT type
        FROM `tabCustomer Asset Configuration`
        WHERE custom_item_group = %s
          AND custom_item_code = %s
          AND model = %s
          AND is_active = 1
        ORDER BY type
    """, (custom_item_group, custom_item_code, model), as_dict=True)


@frappe.whitelist()
def get_capacities(custom_item_group, custom_item_code, model, type):
    if not custom_item_group or not custom_item_code or not model or not type:
        return []

    return frappe.db.sql("""
        SELECT DISTINCT capacity
        FROM `tabCustomer Asset Configuration`
        WHERE custom_item_group = %s
          AND custom_item_code = %s
          AND model = %s
          AND type = %s
          AND is_active = 1
        ORDER BY capacity
    """, (custom_item_group, custom_item_code, model, type), as_dict=True)

@frappe.whitelist()
def get_item_groups():
    rows = frappe.db.sql("""
        SELECT DISTINCT custom_item_group
        FROM `tabCustomer Asset Configuration`
        WHERE is_active = 1
        ORDER BY custom_item_group
    """, as_dict=True)

    return [r.custom_item_group for r in rows]
