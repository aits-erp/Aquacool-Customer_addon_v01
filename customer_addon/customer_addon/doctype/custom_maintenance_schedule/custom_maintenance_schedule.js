// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.provide("erpnext.maintenance");
frappe.ui.form.on("Custom Maintenance Schedule", {
	setup: function (frm) {
		frm.set_query("contact_person", erpnext.queries.contact_query);
		frm.set_query("customer_address", erpnext.queries.address_query);
		frm.set_query("customer", erpnext.queries.customer);

		frm.set_query("serial_and_batch_bundle", "items", (doc, cdt, cdn) => {
			let item = locals[cdt][cdn];

			return {
				filters: {
					item_code: item.item_code,
					voucher_type: "Custom Maintenance Schedule",
					type_of_transaction: "Maintenance",
					company: doc.company,
				},
			};
		});
	},
	onload: function (frm) {
		if (!frm.doc.status) {
			frm.set_value({ status: "Draft" });
		}
		if (frm.doc.__islocal) {
			frm.set_value({ transaction_date: frappe.datetime.get_today() });
		}
	},
	refresh: function (frm) {
		setTimeout(() => {
			frm.toggle_display("generate_schedule", !(frm.is_new() || frm.doc.docstatus));
			frm.toggle_display("schedule", !frm.is_new());
		}, 10);
	},
	customer: function (frm) {
		erpnext.utils.get_party_details(frm);
	},
	customer_address: function (frm) {
		erpnext.utils.get_address_display(frm, "customer_address", "address_display");
	},
	contact_person: function (frm) {
		erpnext.utils.get_contact_details(frm);
	},
	generate_schedule: function (frm) {
		if (frm.is_new()) {
			frappe.msgprint(__("Please save first"));
		} else {
			frm.call("generate_schedule");
		}
	},
});
