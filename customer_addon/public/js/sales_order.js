frappe.ui.form.on("Sales Order", {

    custom_get_items_from(frm) {
        if (!frm.doc.customer) {
            frappe.msgprint("Please select Customer first.");
            return;
        }
        open_maintenance_dialog(frm);
    }
});


// function open_maintenance_dialog(frm) {

//     const dialog = new frappe.ui.Dialog({
//         title: "Fetch Installed Assets",
//         size: "extra-large",
//         fields: [

//             { fieldtype: "Section Break", label: "Filters" },

//             {
//                 fieldname: "location",
//                 label: "Location",
//                 fieldtype: "MultiSelectList",
//                 get_data: function (txt) {
//                     return frappe.db.get_link_options("Customer Location", txt);
//                 },
//                 columns: 2
//             },
//             {
//                 fieldname: "sub_location",
//                 label: "Sub Location",
//                 fieldtype: "Link",
//                 options: "Customer Sub Location",
//                 columns: 2
//             },
//             {
//                 fieldname: "custom_item_group",
//                 label: "Item Group",
//                 fieldtype: "Link",
//                 options: "Customer Asset Group",
//                 columns: 2
//             },
//             {
//                 fieldname: "custom_item_code",
//                 label: "Item Code",
//                 fieldtype: "Link",
//                 options: "Customer Asset Item",
//                 columns: 2
//             },
//             {
//                 fieldname: "model",
//                 label: "Model",
//                 fieldtype: "Link",
//                 options: "Customer Asset Model",
//                 columns: 2
//             },
//             {
//                 fieldname: "type",
//                 label: "Type",
//                 fieldtype: "Link",
//                 options: "Customer Asset Spec",
//                 columns: 2
//             },

//             { fieldtype: "Column Break" },

//             {
//                 fieldtype: "Button",
//                 fieldname: "apply_filters",
//                 label: "Apply Filters"
//             },

//             { fieldtype: "Section Break", label: "Results" },

//             {
//                 fieldname: "preview_html",
//                 fieldtype: "HTML"
//             }
//         ],

//         primary_action_label: "Load Selected",
//         primary_action() {

//             if (!dialog.datatable) {
//                 frappe.msgprint("Please apply filters first.");
//                 return;
//             }

//             const selected_indexes = dialog.datatable.rowmanager.getCheckedRows();

//             if (!selected_indexes.length) {
//                 frappe.msgprint("Please select at least one row.");
//                 return;
//             }

//             frm.clear_table("custom_customer_installed_assets");

//             selected_indexes.forEach(index => {

//                 const row = dialog.data[index];

//                 let d = frm.add_child("custom_customer_installed_assets");

//                 d.location = row.location;
//                 d.sub_location = row.sub_location;
//                 d.sub_location_address = row.sub_location_address;

//                 d.item_group = row.custom_item_group;
//                 d.item_code = row.custom_item_code;

//                 d.model = row.model;
//                 d.type = row.type;

//                 d.amc = row.amc;
//                 d.start_date = row.start_date;
//                 d.end_date = row.end_date;
//                 d.warrenty = row.warrenty;
//             });

//             frm.refresh_field("custom_customer_installed_assets");
//             dialog.hide();
//         }
//     });

//     dialog.show();

//     dialog.get_field("apply_filters").$input.on("click", function () {
//         fetch_assets(frm, dialog);
//     });
// }
function open_maintenance_dialog(frm) {

    const dialog = new frappe.ui.Dialog({
        title: "Fetch Installed Assets",
        size: "extra-large",
        fields: [

            { fieldtype: "Section Break" },

            {
                fieldname: "location",
                label: "Location",
                fieldtype: "MultiSelectList",
                get_data: function (txt) {
                    return frappe.db.get_link_options("Customer Location", txt);
                },
                columns: 3
            },
            {
                fieldname: "sub_location",
                label: "Sub Location",
                fieldtype: "Link",
                options: "Customer Sub Location",
                columns: 3
            },
            {
                fieldname: "custom_item_group",
                label: "Item Group",
                fieldtype: "Link",
                options: "Customer Asset Group",
                columns: 3
            },

            { fieldtype: "Column Break" },

            {
                fieldname: "custom_item_code",
                label: "Item Code",
                fieldtype: "Link",
                options: "Customer Asset Item",
                columns: 3
            },
            {
                fieldname: "model",
                label: "Model",
                fieldtype: "Link",
                options: "Customer Asset Model",
                columns: 3
            },
            {
                fieldname: "type",
                label: "Type",
                fieldtype: "Link",
                options: "Customer Asset Spec",
                columns: 3
            },

            { fieldtype: "Column Break" },

            {
                fieldtype: "Button",
                fieldname: "apply_filters",
                label: "Apply"
            },

            { fieldtype: "Section Break" },

            {
                fieldname: "preview_html",
                fieldtype: "HTML"
            }
        ],

        primary_action_label: "Load Selected",
        primary_action() {

            if (!dialog.datatable) {
                frappe.msgprint("Please apply filters first.");
                return;
            }

            const selected = dialog.datatable.rowmanager.getCheckedRows();

            if (!selected.length) {
                frappe.msgprint("Please select at least one row.");
                return;
            }

            frm.clear_table("custom_customer_installed_assets");

            selected.forEach(index => {

                const row = dialog.data[index];

                let d = frm.add_child("custom_customer_installed_assets");

                d.location = row.location;
                d.sub_location = row.sub_location;
                d.sub_location_address = row.sub_location_address;

                d.item_group = row.custom_item_group;
                d.item_code = row.custom_item_code;

                d.model = row.model;
                d.type = row.type;

                d.amc = row.amc;
                d.start_date = row.start_date;
                d.end_date = row.end_date;
                d.warrenty = row.warrenty;
            });

            frm.refresh_field("custom_customer_installed_assets");
            dialog.hide();
        }
    });

    dialog.show();

    // Attach Apply button
    dialog.get_field("apply_filters").$input.addClass("btn-primary");

    dialog.get_field("apply_filters").$input.on("click", function () {
        fetch_assets(frm, dialog);
    });
}




function fetch_assets(frm, dialog) {

    const values = dialog.get_values();

    frappe.call({
        method: "customer_addon.api.sales_order.get_customer_assets",
        args: {
            customer: frm.doc.customer,
            filters: values
        },
        callback(r) {

            const data = r.message || [];

            if (!data.length) {
                dialog.fields_dict.preview_html.$wrapper.html("<p>No records found.</p>");
                return;
            }

            dialog.data = data;
            dialog.fields_dict.preview_html.$wrapper.empty();

            dialog.datatable = new frappe.DataTable(
    dialog.fields_dict.preview_html.$wrapper.get(0),
    {
        columns: [
            { name: "Location", id: "location", width: 180 },
            { name: "Sub Location", id: "sub_location", width: 150 },
            { name: "Group", id: "custom_item_group", width: 140 },
            { name: "Item", id: "custom_item_code", width: 120 },
            { name: "Model", id: "model", width: 150 },
            { name: "Type", id: "type", width: 120 },
            { name: "AMC", id: "amc", width: 80 }
        ],
        data: data,
        checkboxColumn: true,
        serialNoColumn: false,
        layout: "fixed",
        noDataMessage: "No matching assets found"
    }
);

        }
    });
}


// frappe.ui.form.on("Sales Order", {

//     custom_get_items_from(frm) {
//         if (!frm.doc.customer) {
//             frappe.msgprint("Please select Customer first.");
//             return;
//         }
//         open_maintenance_dialog(frm);
//     }
// });


// function open_maintenance_dialog(frm) {

//     const dialog = new frappe.ui.Dialog({
//         title: "Fetch Installed Assets",
//         size: "extra-large",
//         fields: [

//             { fieldtype: "Section Break", label: "Filters" },

//             { fieldname: "location", label: "Location", fieldtype: "Link", options: "Customer Location" },
//             { fieldname: "sub_location", label: "Sub Location", fieldtype: "Link", options: "Customer Sub Location" },
//             { fieldname: "custom_item_group", label: "Item Group", fieldtype: "Link", options: "Customer Asset Group" },
//             { fieldname: "custom_item_code", label: "Item Code", fieldtype: "Link", options: "Customer Asset Item" },
//             { fieldname: "model", label: "Model", fieldtype: "Link", options: "Customer Asset Model" },
//             { fieldname: "type", label: "Type", fieldtype: "Link", options: "Customer Asset Spec" },

//             { fieldtype: "Column Break" },

//             {
//                 fieldtype: "Button",
//                 fieldname: "apply_filters",
//                 label: "Apply Filters"
//             },

//             { fieldtype: "Section Break", label: "Results" },

//             {
//                 fieldname: "preview_html",
//                 fieldtype: "HTML"
//             }
//         ],

//         primary_action_label: "Load Selected",
//         primary_action() {

//     if (!dialog.datatable) {
//         frappe.msgprint("Please apply filters first.");
//         return;
//     }

//     const selected_indexes = dialog.datatable.rowmanager.getCheckedRows();

//     if (!selected_indexes.length) {
//         frappe.msgprint("Please select at least one row.");
//         return;
//     }

//     frm.clear_table("custom_customer_installed_assets");

//     selected_indexes.forEach(index => {

//         const row = dialog.data[index];

//         let d = frm.add_child("custom_customer_installed_assets");

//         d.location = row.location;
//         d.sub_location = row.sub_location;
//         d.sub_location_address = row.sub_location_address;

//         d.item_group = row.custom_item_group;
//         d.item_code = row.custom_item_code;

//         d.model = row.model;
//         d.type = row.type;

//         d.amc = row.amc;
//         d.start_date = row.start_date;
//         d.end_date = row.end_date;
//         d.warrenty = row.warrenty;
//     });

//     frm.refresh_field("custom_customer_installed_assets");
//     dialog.hide();
// }

//     });

//     dialog.show();

//     dialog.get_field("apply_filters").$input.on("click", function () {
//         fetch_assets(frm, dialog);
//     });
// }



// function fetch_assets(frm, dialog) {

//     const filters = dialog.get_values();

//     frappe.call({
//         method: "customer_addon.api.sales_order.get_customer_assets",
//         args: {
//             customer: frm.doc.customer,
//             filters: filters
//         },
//         callback(r) {

//             const data = r.message || [];

//             if (!data.length) {
//                 dialog.fields_dict.preview_html.$wrapper.html("<p>No records found.</p>");
//                 return;
//             }

//             dialog.data = data;

//             dialog.fields_dict.preview_html.$wrapper.empty();

//             dialog.datatable = new frappe.DataTable(
//                 dialog.fields_dict.preview_html.$wrapper.get(0),
//                 {
//                     columns: [
//                         { name: "Location", id: "location" },
//                         { name: "Sub Location", id: "sub_location" },
//                         { name: "Group", id: "custom_item_group" },
//                         { name: "Item", id: "custom_item_code" },
//                         { name: "Model", id: "model" },
//                         { name: "Type", id: "type" },
//                         { name: "AMC", id: "amc" }
//                     ],
//                     data: data,
//                     checkboxColumn: true,
//                     serialNoColumn: false,
//                     layout: "fluid"
//                 }
//             );
//         }
//     });
// }
