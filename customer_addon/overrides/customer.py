import frappe
from frappe import _

def validate(doc, method):
    validate_installed_assets(doc)


def validate_installed_assets(doc):
    seen = set()

    for idx, row in enumerate(doc.custom_customer_installed_assets, start=1):

        # ---------------------------
        # Mandatory checks (NEW RULES)
        # ---------------------------
        if not row.location:
            frappe.throw(_("Row {0}: Location is mandatory").format(idx))

        if not row.custom_item_group:
            frappe.throw(_("Row {0}: Custom Item Group is mandatory").format(idx))

        if not row.custom_item_code:
            frappe.throw(_("Row {0}: Custom Item Code is mandatory").format(idx))

        # ---------------------------
        # Duplicate check (SAFE)
        # ---------------------------
        dup_key = (
            row.location,
            row.custom_item_group,
            row.custom_item_code,
            row.model or "",
            row.type or ""
        )

        if dup_key in seen:
            frappe.throw(
                _(
                    "Row {0}: Duplicate asset found in the same location "
                    "(same group, code, model and type)."
                ).format(idx)
            )

        seen.add(dup_key)

        # ---------------------------
        # Link integrity validation
        # ---------------------------
        if row.custom_item_group and not frappe.db.exists(
            "Customer Asset Group", row.custom_item_group
        ):
            frappe.throw(
                _("Row {0}: Asset Group '{1}' does not exist").format(
                    idx, row.custom_item_group
                )
            )

        if row.custom_item_code and not frappe.db.exists(
            "Customer Asset Item", row.custom_item_code
        ):
            frappe.throw(
                _("Row {0}: Asset Item '{1}' does not exist").format(
                    idx, row.custom_item_code
                )
            )

        if row.model and not frappe.db.exists(
            "Customer Asset Model", row.model
        ):
            frappe.throw(
                _("Row {0}: Asset Model '{1}' does not exist").format(
                    idx, row.model
                )
            )

        if row.type and not frappe.db.exists(
            "Customer Asset Spec", row.type
        ):
            frappe.throw(
                _("Row {0}: Asset Spec '{1}' does not exist").format(
                    idx, row.type
                )
            )
