frappe.ui.form.on("Sales Order", {

    custom_get_items_from(frm) {
        if (!frm.doc.customer) {
            frappe.msgprint("Please select Customer first.");
            return;
        }
        open_maintenance_dialog(frm);
    }
});


function open_maintenance_dialog(frm) {

    const dialog = new frappe.ui.Dialog({
        title: "Fetch Installed Assets",
        size: "extra-large",
        fields: [

            { fieldtype: "Section Break", label: "Filters" },

            { fieldname: "location", label: "Location", fieldtype: "Link", options: "Customer Location" },
            { fieldname: "sub_location", label: "Sub Location", fieldtype: "Link", options: "Customer Sub Location" },
            { fieldname: "custom_item_group", label: "Item Group", fieldtype: "Link", options: "Customer Asset Group" },
            { fieldname: "custom_item_code", label: "Item Code", fieldtype: "Link", options: "Customer Asset Item" },
            { fieldname: "model", label: "Model", fieldtype: "Link", options: "Customer Asset Model" },
            { fieldname: "type", label: "Type", fieldtype: "Link", options: "Customer Asset Spec" },

            { fieldtype: "Column Break" },

            {
                fieldtype: "Button",
                fieldname: "apply_filters",
                label: "Apply Filters"
            },

            { fieldtype: "Section Break", label: "Results" },

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

    const selected_indexes = dialog.datatable.rowmanager.getCheckedRows();

    if (!selected_indexes.length) {
        frappe.msgprint("Please select at least one row.");
        return;
    }

    frm.clear_table("custom_customer_installed_assets");

    selected_indexes.forEach(index => {

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

    dialog.get_field("apply_filters").$input.on("click", function () {
        fetch_assets(frm, dialog);
    });
}



function fetch_assets(frm, dialog) {

    const filters = dialog.get_values();

    frappe.call({
        method: "customer_addon.api.sales_order.get_customer_assets",
        args: {
            customer: frm.doc.customer,
            filters: filters
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
                        { name: "Location", id: "location" },
                        { name: "Sub Location", id: "sub_location" },
                        { name: "Group", id: "custom_item_group" },
                        { name: "Item", id: "custom_item_code" },
                        { name: "Model", id: "model" },
                        { name: "Type", id: "type" },
                        { name: "AMC", id: "amc" }
                    ],
                    data: data,
                    checkboxColumn: true,
                    serialNoColumn: false,
                    layout: "fluid"
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
//         size: "large",
//         fields: [

//             { fieldname: "location", label: "Location", fieldtype: "Link", options: "Customer Location" },
//             { fieldname: "sub_location", label: "Sub Location", fieldtype: "Link", options: "Customer Sub Location" },
//             { fieldname: "custom_item_group", label: "Item Group", fieldtype: "Link", options: "Customer Asset Group" },
//             { fieldname: "custom_item_code", label: "Item Code", fieldtype: "Link", options: "Customer Asset Item" },
//             { fieldname: "model", label: "Model", fieldtype: "Link", options: "Customer Asset Model" },
//             { fieldname: "type", label: "Type", fieldtype: "Link", options: "Customer Asset Spec" },

//             { fieldtype: "Section Break" },
//             { fieldname: "preview_html", fieldtype: "HTML" }
//         ],

//         primary_action_label: "Load Selected",
//         primary_action() {

//             if (!dialog.selected_rows || !dialog.selected_rows.length) {
//                 frappe.msgprint("Please select at least one row.");
//                 return;
//             }

//             // Clear existing rows before inserting
//             frm.clear_table("custom_customer_installed_assets");

//             dialog.selected_rows.forEach(row => {
//                 let d = frm.add_child("custom_customer_installed_assets");

//                 d.location = row.location;
//                 d.sub_location = row.sub_location;
//                 d.sub_location_address = row.sub_location_address;

//                 // Mapping different fieldnames
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

//     dialog.add_custom_action("Apply Filters", () => {
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

//             let html = `<table class="table table-bordered">
//                 <thead>
//                     <tr>
//                         <th>Select</th>
//                         <th>Location</th>
//                         <th>Sub Location</th>
//                         <th>Group</th>
//                         <th>Item</th>
//                         <th>Model</th>
//                         <th>Type</th>
//                     </tr>
//                 </thead><tbody>`;

//             data.forEach((row, idx) => {
//                 html += `
//                     <tr>
//                         <td><input type="checkbox" data-idx="${idx}"></td>
//                         <td>${row.location || ""}</td>
//                         <td>${row.sub_location || ""}</td>
//                         <td>${row.custom_item_group || ""}</td>
//                         <td>${row.custom_item_code || ""}</td>
//                         <td>${row.model || ""}</td>
//                         <td>${row.type || ""}</td>
//                     </tr>`;
//             });

//             html += "</tbody></table>";

//             dialog.fields_dict.preview_html.$wrapper.html(html);

//             dialog.selected_rows = [];

//             dialog.fields_dict.preview_html.$wrapper.find("input[type='checkbox']").on("change", function () {

//                 const index = $(this).data("idx");

//                 if (this.checked) {
//                     dialog.selected_rows.push(data[index]);
//                 } else {
//                     dialog.selected_rows = dialog.selected_rows.filter(r => r !== data[index]);
//                 }
//             });
//         }
//     });
// }
