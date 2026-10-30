// frappe.ui.form.on("Custom Maintenance Schedule", {

//     setup(frm) {
//         frm.set_query("sales_order", () => {
//             return {
//                 filters: {
//                     customer: frm.doc.customer
//                 }
//             };
//         });
//     },

//     customer(frm) {
//         frm.set_value("sales_order", "");
//         frm.clear_table("items");
//         frm.refresh_field("items");
//     },
    
//     load_items(frm) {
//         if (!frm.doc.sales_order) {
//             frappe.msgprint("Please select a Sales Order first.");
//             return;
//         }

//         const load_rows = () => {
//             frappe.call({
//                 method: "frappe.client.get",
//                 args: {
//                     doctype: "Sales Order",
//                     name: frm.doc.sales_order
//                 },
//                 callback(r) {
//                     if (!r.message) {
//                         frappe.msgprint("Sales Order could not be loaded.");
//                         return;
//                     }

//                     const assets = r.message.custom_customer_installed_assets || [];

//                     if (!assets.length) {
//                         frappe.msgprint(
//                             "No maintenance assets were found in the selected Sales Order."
//                         );
//                         return;
//                     }

//                     frm.clear_table("items");

//                     assets.forEach(d => {
//                         frm.add_child("items", {
//                             item_code: d.item_code,
//                             serial_no: d.name,
//                             sales_order: frm.doc.sales_order,
//                             start_date: d.start_date,
//                             end_date: d.end_date,
//                             custom_location: d.location
//                         });
//                     });

//                     frm.refresh_field("items");
//                     frm.dirty();
//                 }
//             });
//         };

//         if (frm.doc.items?.length) {
//             frappe.confirm(
//                 "Loading items will replace the existing rows. Continue?",
//                 load_rows
//             );
//             return;
//         }

//         load_rows();
//     },

//     // ⭐ THIS WAS MISSING
//     generate_schedule(frm) {

//         if (frm.is_new()) {
//             frappe.msgprint("Please save the document first.");
//             return;
//         }

//         frm.call("generate_schedule").then(() => {
//             frm.refresh_field("schedules");
//             frappe.msgprint("Schedule Generated Successfully");
//         });

//     }

// });



function apply_schedule_defaults(frm) {

    if (!frm.doc.items || !frm.doc.items.length) return;

    frm.doc.items.forEach(row => {

        if (frm.doc.default_start_date) {
            row.start_date = frm.doc.default_start_date;
        }

        if (frm.doc.select) {
            row.periodicity = frm.doc.select;
        }

        if (frm.doc.default_no_of_visits) {
            row.no_of_visits = frm.doc.default_no_of_visits;
        }

        if (frm.doc.default_end_date) {
            row.end_date = frm.doc.default_end_date;
        }

    });

    frm.refresh_field("items");
    frm.dirty();
}


frappe.ui.form.on("Custom Maintenance Schedule", {

    setup(frm) {

        frm.set_query("sales_order", () => {
            return {
                filters: {
                    customer: frm.doc.customer
                }
            };
        });

    },

    customer(frm) {

        frm.set_value("sales_order", "");
        frm.clear_table("items");
        frm.refresh_field("items");

    },

    // Apply defaults when parent fields change

    default_start_date(frm) {
        apply_schedule_defaults(frm);
    },

    select(frm) {
        apply_schedule_defaults(frm);
    },

    default_no_of_visits(frm) {
        apply_schedule_defaults(frm);
    },

    default_end_date(frm) {
        apply_schedule_defaults(frm);
    },

    // Load Items from Sales Order

    load_items(frm) {

        if (!frm.doc.sales_order) {
            frappe.msgprint("Please select a Sales Order first.");
            return;
        }

        const load_rows = () => {

            frappe.call({

                method: "frappe.client.get",

                args: {
                    doctype: "Sales Order",
                    name: frm.doc.sales_order
                },

                callback(r) {

                    if (!r.message) {

                        frappe.msgprint(
                            "Sales Order could not be loaded."
                        );

                        return;
                    }

                    const assets =
                        r.message.custom_customer_installed_assets || [];

                    if (!assets.length) {

                        frappe.msgprint(
                            "No maintenance assets were found in the selected Sales Order."
                        );

                        return;
                    }

                    frm.clear_table("items");

                    assets.forEach(d => {

                        frm.add_child("items", {

                            item_code: d.item_code,

                            serial_no: d.name,

                            sales_order: frm.doc.sales_order,

                            custom_location: d.location,

                            // Default Start Date
                            start_date:
                                frm.doc.default_start_date || d.start_date,

                            // Default Periodicity
                            periodicity:
                                frm.doc.select || "",

                            // Default No. of Visits
                            no_of_visits:
                                frm.doc.default_no_of_visits || 0,

                            // Default End Date
                            end_date:
                                frm.doc.default_end_date || d.end_date

                        });

                    });

                    frm.refresh_field("items");
                    frm.dirty();

                }

            });

        };

        if (frm.doc.items?.length) {

            frappe.confirm(
                "Loading items will replace the existing rows. Continue?",
                load_rows
            );

            return;
        }

        load_rows();

    },

    // Generate Schedule

    generate_schedule(frm) {

        if (frm.is_new()) {

            frappe.msgprint(
                "Please save the document first."
            );

            return;
        }

        frm.call("generate_schedule").then(() => {

            frm.refresh_field("schedules");

            frappe.msgprint(
                "Schedule Generated Successfully"
            );

        });

    }

});
