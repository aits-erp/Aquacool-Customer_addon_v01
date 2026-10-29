# import frappe
# from frappe import _


# def get_data(data=None):
#     data = data or {}

#     transactions = data.get("transactions", [])

#     activity_group = next(
#         (
#             group for group in transactions
#             if group.get("label") == _("Activity")
#         ),
#         None
#     )

#     if activity_group:
#         items = activity_group.setdefault("items", [])
#         if "Service Call Custom" not in items:
#             items.append("Service Call Custom")
#     else:
#         transactions.append({
#             "label": _("Activity"),
#             "items": ["Task", "Service Call Custom"]
#         })

#     data["transactions"] = transactions

#     data.setdefault("non_standard_fieldnames", {})
#     data["non_standard_fieldnames"]["Service Call Custom"] = "custom_issue"
    
#     # data["non_standard_fieldnames"]["Service Call Custom"] = "issue"

#     return data





import frappe
from frappe import _


def get_data(data=None):
    data = data or {}

    transactions = data.get("transactions", [])

    activity_group = next(
        (
            group for group in transactions
            if group.get("label") == _("Activity")
        ),
        None
    )

    if activity_group:
        items = activity_group.setdefault("items", [])

        if "Service Call Custom" not in items:
            items.append("Service Call Custom")
    else:
        transactions.append({
            "label": _("Activity"),
            "items": ["Task", "Service Call Custom"]
        })

    data["transactions"] = transactions

    data.setdefault("non_standard_fieldnames", {})
    data["non_standard_fieldnames"]["Service Call Custom"] = "issue"

    return data
