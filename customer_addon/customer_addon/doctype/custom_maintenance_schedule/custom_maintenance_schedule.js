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

    sales_order(frm) {

    if (!frm.doc.sales_order) return;

    // prevent reload if items already loaded
    if (frm.doc.items && frm.doc.items.length > 0) {
        return;
    }

    frappe.call({
        method: "frappe.client.get",
        args: {
            doctype: "Sales Order",
            name: frm.doc.sales_order
        },
        callback(r) {

            if (!r.message) return;

            let assets = r.message.custom_customer_installed_assets || [];

            frm.clear_table("items");

            assets.forEach(d => {

                frm.add_child("items", {
                    item_code: d.item_code,
                    serial_no: d.name,
                    sales_order: frm.doc.sales_order,
                    start_date: d.start_date,
                    end_date: d.end_date,
                    custom_location: d.location
                });

            });

            frm.refresh_field("items");

        }
    });

},
    // ⭐ THIS WAS MISSING
    generate_schedule(frm) {

        if (frm.is_new()) {
            frappe.msgprint("Please save the document first.");
            return;
        }

        frm.call("generate_schedule").then(() => {
            frm.refresh_field("schedules");
            frappe.msgprint("Schedule Generated Successfully");
        });

    }

});

// frappe.ui.form.on("Custom Maintenancce Schedule", {
//     customer: function(frm) {

//         frm.set_query("sales_order", function() {
//             return {
//                 filters: {
//                     customer: frm.doc.customer,
//                     docstatus: 1
//                 }
//             };
//         });

//     }
// });



// frappe.ui.form.on("Custom Maintenancce Schedule", {
//     customer(frm) {
//         console.log("Customer changed", frm.doc.customer)
//     }
// });

// frappe.ui.form.on("Custom Maintenance Schedule", {

//     setup: function(frm) {
//         frm.set_query("sales_order", function() {
//             return {
//                 filters: {
//                     customer: frm.doc.customer
//                 }
//             };
//         });
//     },

//     customer: function(frm) {
//         frm.set_value("sales_order", "");
//     }

// });


// frappe.ui.form.on("Custom Maintenance Schedule", {

//     sales_order: function(frm) {

//         if (!frm.doc.sales_order) return;

//         frappe.call({
//             method: "frappe.client.get",
//             args: {
//                 doctype: "Sales Order",
//                 name: frm.doc.sales_order
//             },
//             callback: function(r) {

//                 if (!r.message) return;

//                 console.log("Installed Assets:", r.message.custom_customer_installed_assets);

//                 frm.clear_table("items");

//                 (r.message.custom_customer_installed_assets || []).forEach(function(d){

//                     let row = frm.add_child("items");

//                     row.item_code = d.item_code;
					
//                     row.serial_no = d.name;  
//                     row.sales_order = frm.doc.sales_order;
//                     row.start_date = d.start_date;
//                     row.end_date = d.end_date;
// 					row.custom_location = d.custom_location;

//                 });

//                 frm.refresh_field("items");

//             }
//         });

//     }

// });


// frappe.ui.form.on("Custom Maintenance Schedule", {

//     generate_schedule: function(frm) {

//         frm.call("generate_schedule").then(() => {

//             frm.refresh_field("schedules");

//             frappe.msgprint("Schedule Generated");

//         });

//     }

// });