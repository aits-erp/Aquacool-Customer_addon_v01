/**************************************
 * CUSTOMER INSTALLED ASSET (CHILD TABLE)
 **************************************/
frappe.ui.form.on("Customer Installed Asset", {

    location(frm, cdt, cdn) {
    const row = locals[cdt][cdn];

    // If you want to auto-fetch address from Customer Location
    if (row.location) {
        frappe.db.get_value(
            "Customer Location",
            row.location,
            "description",   // fieldname stays same!
            function (r) {
                if (r && r.description) {
                    row.sub_location_address = r.description;
                    frm.refresh_field("custom_customer_installed_assets");
                }
            }
        );
    }
},

    // ------------------------------------
    // ASSET GROUP → ASSET ITEM
    // ------------------------------------
    custom_item_group(frm, cdt, cdn) {
        const row = locals[cdt][cdn];

        row.custom_item_code = null;
        row.model = null;
        row.type = null;
        row.capacity = null;

        frm.set_query(
            "custom_item_code",
            "custom_customer_installed_assets",
            function () {
                return {
                    filters: {
                        asset_group: row.custom_item_group
                    }
                };
            }
        );
    },

    // ------------------------------------
    // ASSET ITEM → MODEL
    // ------------------------------------
    custom_item_code(frm, cdt, cdn) {
        const row = locals[cdt][cdn];

        row.model = null;
        row.type = null;
        row.capacity = null;

        frm.set_query(
            "model",
            "custom_customer_installed_assets",
            function () {
                return {
                    filters: {
                        asset_item: row.custom_item_code
                    }
                };
            }
        );
    },

    // ------------------------------------
    // MODEL → SPEC (TYPE + CAPACITY)
    // ------------------------------------
    model(frm, cdt, cdn) {
        const row = locals[cdt][cdn];

        row.type = null;
        row.capacity = null;

        frm.set_query(
            "type",
            "custom_customer_installed_assets",
            function () {
                return {
                    filters: {
                        asset_model: row.model
                    }
                };
            }
        );
    }

});


// /**************************************
//  * CUSTOMER FORM
//  **************************************/
// frappe.ui.form.on("Customer", {
//     onload(frm) {
//         // Load & cache item groups once
//         frappe.call({
//             method: "customer_addon.api.asset_filters.get_item_groups",
//             callback(r) {
//                 frm._asset_item_groups = r.message || [];
//             }
//         });
//     }
// });


// /**************************************
//  * CUSTOMER INSTALLED ASSET (CHILD TABLE)
//  **************************************/
// frappe.ui.form.on("Customer Installed Asset", {

//     /**
//      * VERY IMPORTANT:
//      * This runs AFTER grid row editor is rendered.
//      * This is the ONLY safe place to inject Select options.
//      */
//     on_grid_fields_rendered(frm) {
//         const grid = frm.fields_dict.custom_customer_installed_assets.grid;
//         if (!grid) return;

//         const groups = frm._asset_item_groups || [];

//         grid.grid_rows.forEach(row => {
//             if (!row.grid_form) return;

//             const field = row.grid_form.fields_dict.custom_item_group;
//             if (field && groups.length) {
//                 field.df.options = groups.join("\n");
//                 field.refresh();
//             }
//         });
//     },

//     // ------------------------------------------------
//     // LOCATION → SUB LOCATION
//     // ------------------------------------------------
//     location(frm, cdt, cdn) {
//         const row = locals[cdt][cdn];

//         row.sub_location = null;
//         row.sub_location_address = null;
//         frm.refresh_field("custom_customer_installed_assets");

//         if (!row.location) return;

//         frm.set_query("sub_location", "custom_customer_installed_assets", function () {
//             return {
//                 filters: { location: row.location }
//             };
//         });
//     },

//     // ------------------------------------------------
//     // SUB LOCATION → ADDRESS
//     // ------------------------------------------------
//     sub_location(frm, cdt, cdn) {
//         const row = locals[cdt][cdn];
//         if (!row.sub_location) return;

//         frappe.db.get_value(
//             "Customer Sub Location",
//             row.sub_location,
//             "sub_location_address"
//         ).then(r => {
//             row.sub_location_address = r.message.sub_location_address;
//             frm.refresh_field("custom_customer_installed_assets");
//         });
//     },

//     // ------------------------------------------------
//     // ITEM GROUP → ITEM CODE
//     // ------------------------------------------------
//     custom_item_group(frm, cdt, cdn) {
//         const row = locals[cdt][cdn];
//         const grid = frm.fields_dict.custom_customer_installed_assets.grid;
//         const grid_row = grid.grid_rows_by_docname[cdn];

//         row.custom_item_code = null;
//         row.model = null;
//         row.type = null;
//         row.capacity = null;
//         frm.refresh_field("custom_customer_installed_assets");

//         if (!row.custom_item_group || !grid_row?.grid_form) return;

//         const field = grid_row.grid_form.fields_dict.custom_item_code;

//         frappe.call({
//             method: "customer_addon.api.asset_filters.get_item_codes",
//             args: { custom_item_group: row.custom_item_group },
//             callback(r) {
//                 const options = (r.message || []).map(d => d.custom_item_code);
//                 field.df.options = options.join("\n");
//                 field.refresh();
//             }
//         });
//     },

//     // ------------------------------------------------
//     // ITEM CODE → MODEL
//     // ------------------------------------------------
//     custom_item_code(frm, cdt, cdn) {
//         const row = locals[cdt][cdn];
//         const grid = frm.fields_dict.custom_customer_installed_assets.grid;
//         const grid_row = grid.grid_rows_by_docname[cdn];

//         row.model = null;
//         row.type = null;
//         row.capacity = null;
//         frm.refresh_field("custom_customer_installed_assets");

//         if (!row.custom_item_code || !grid_row?.grid_form) return;

//         const field = grid_row.grid_form.fields_dict.model;

//         frappe.call({
//             method: "customer_addon.api.asset_filters.get_models",
//             args: {
//                 custom_item_group: row.custom_item_group,
//                 custom_item_code: row.custom_item_code
//             },
//             callback(r) {
//                 const options = (r.message || []).map(d => d.model);
//                 field.df.options = options.join("\n");
//                 field.refresh();
//             }
//         });
//     },

//     // ------------------------------------------------
//     // MODEL → TYPE
//     // ------------------------------------------------
//     model(frm, cdt, cdn) {
//         const row = locals[cdt][cdn];
//         const grid = frm.fields_dict.custom_customer_installed_assets.grid;
//         const grid_row = grid.grid_rows_by_docname[cdn];

//         row.type = null;
//         row.capacity = null;
//         frm.refresh_field("custom_customer_installed_assets");

//         if (!row.model || !grid_row?.grid_form) return;

//         const field = grid_row.grid_form.fields_dict.type;

//         frappe.call({
//             method: "customer_addon.api.asset_filters.get_types",
//             args: {
//                 custom_item_group: row.custom_item_group,
//                 custom_item_code: row.custom_item_code,
//                 model: row.model
//             },
//             callback(r) {
//                 const options = (r.message || []).map(d => d.type);
//                 field.df.options = options.join("\n");
//                 field.refresh();
//             }
//         });
//     },

//     // ------------------------------------------------
//     // TYPE → CAPACITY
//     // ------------------------------------------------
//     type(frm, cdt, cdn) {
//         const row = locals[cdt][cdn];
//         const grid = frm.fields_dict.custom_customer_installed_assets.grid;
//         const grid_row = grid.grid_rows_by_docname[cdn];

//         row.capacity = null;
//         frm.refresh_field("custom_customer_installed_assets");

//         if (!row.type || !grid_row?.grid_form) return;

//         const field = grid_row.grid_form.fields_dict.capacity;

//         frappe.call({
//             method: "customer_addon.api.asset_filters.get_capacities",
//             args: {
//                 custom_item_group: row.custom_item_group,
//                 custom_item_code: row.custom_item_code,
//                 model: row.model,
//                 type: row.type
//             },
//             callback(r) {
//                 const options = (r.message || []).map(d => d.capacity);
//                 field.df.options = options.join("\n");
//                 field.refresh();
//             }
//         });
//     }
// });
