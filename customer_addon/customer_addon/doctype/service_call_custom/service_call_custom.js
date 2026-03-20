frappe.ui.form.on("Service Call Custom", {

    setup(frm) {
        frm.set_query("service_no", function () {
            return {
                query: "customer_addon.customer_addon.doctype.service_call_custom.service_call_custom.get_service_no"
            };
        });
    },

    service_no(frm) {

        if (!frm.doc.service_no) return;

        frappe.call({
            method: "customer_addon.customer_addon.doctype.service_call_custom.service_call_custom.get_service_details",
            args: {
                service_no: frm.doc.service_no
            },
            callback: function (r) {

                console.log("DATA:", r.message);

                if (!r.message || !r.message.items) {
                    frappe.msgprint("No data found");
                    return;
                }

                let data = r.message;

                // Safe set
                if (data.service_no_display) {
                    frm.set_value("custom_service_no_display", data.service_no_display);
                }

                if (data.customer) {
                    frm.set_value("customer", data.customer);
                }

                if (data.location) {
                    frm.set_value("location", data.location);
                }

                if (data.schedule_date) {
                    frm.set_value("schedule_date", data.schedule_date);
                }

                // 🔥 FIXED TABLE NAME
                frm.clear_table("custom_items");

                data.items.forEach(d => {

                    let row = frm.add_child("custom_items");

                    row.item_code = d.item_code;
                    row.serial_no = d.serial_no;

                });

                frm.refresh_field("custom_items");

            }
        });

    }

});



// frappe.ui.form.on("Service Call Custom", {

//     setup(frm) {
//         frm.set_query("service_no", function () {
//             return {
//                 query: "customer_addon.customer_addon.doctype.service_call_custom.service_call_custom.get_service_no"
//             };
//         });
//     },

//     service_no(frm) {

//         let service_no = frm.doc.service_no;

//         console.log("Selected ID:", service_no);

//         if (!service_no) return;

//         frappe.call({
//             method: "customer_addon.customer_addon.doctype.service_call_custom.service_call_custom.get_service_details",
//             args: {
//                 service_no: service_no
//             },
//             callback: function (r) {

//                 console.log("FULL RESPONSE:", r);
//                 console.log("DATA:", r.message);

//                 // 🔥 FIX 1: strict check
//                 if (!r.message || !r.message.items || r.message.items.length === 0) {
//                     frappe.msgprint("No items found for this Service No");
//                     frm.clear_table("items");
//                     frm.refresh_field("items");
//                     return;
//                 }

//                 let data = r.message;

//                 // 🔥 FIX 2: set display properly
//                 frm.set_value("custom_service_no_display", data.service_no_display || "");

//                 // 🔥 Main fields
//                 frm.set_value("customer", data.customer || "");
//                 frm.set_value("location", data.location || "");
//                 frm.set_value("schedule_date", data.schedule_date || "");

//                 // 🔥 Clear table first
//                 frm.clear_table("items");

//                 // 🔥 Add items (important safe loop)
//                 data.items.forEach(d => {

//                     console.log("ITEM:", d);

//                     let row = frm.add_child("items");

//                     row.item_code = d.item_code || "";
//                     row.serial_no = d.serial_no || "";

//                 });

//                 frm.refresh_field("items");

//             }
//         });

//     }

// });


// frappe.ui.form.on("Service Call Custom", {

//     setup(frm) {
//         frm.set_query("service_no", function () {
//             return {
//                 query: "customer_addon.customer_addon.doctype.service_call_custom.service_call_custom.get_service_no"
//             };
//         });
//     },

//     service_no(frm) {

//         if (!frm.doc.service_no) return;

//         frappe.call({
//             method: "customer_addon.customer_addon.doctype.service_call_custom.service_call_custom.get_service_details",
//             args: {
//                 service_no: frm.doc.service_no
//             },
//             callback: function (r) {

//                 if (!r.message) {
//                     frappe.msgprint("No data found");
//                     return;
//                 }

//                 let data = r.message;

//                 frm.set_value("custom_service_no_display", data.service_no_display || "");
//                 frm.set_value("customer", data.customer || "");
//                 frm.set_value("location", data.location || "");
//                 frm.set_value("schedule_date", data.schedule_date || "");

//                 frm.clear_table("items");

//                 (data.items || []).forEach(d => {
//                     let row = frm.add_child("items");
//                     row.item_code = d.item_code;
//                     row.serial_no = d.serial_no;
//                 });

//                 frm.refresh_field("items");

//             }
//         });

//     }

// });