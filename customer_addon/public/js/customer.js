// /**************************************
//  * CUSTOMER INSTALLED ASSET (CHILD TABLE)
//  **************************************/
// frappe.ui.form.on("Customer Installed Asset", {
//         location(frm, cdt, cdn) {
//             const row = locals[cdt][cdn];

//             if (row.location) {
//                 frappe.db.get_value(
//                     "Customer Location",
//                     row.location,
//                     "description"
//                 ).then(r => {
//                     if (r && r.message && r.message.description) {
//                         frappe.model.set_value(
//                             cdt,
//                             cdn,
//                             "address",
//                             r.message.description
//                         );
//                     }
//                 });
//             }
//         },


//     // ------------------------------------
//     // ASSET GROUP → ASSET ITEM
//     // ------------------------------------
//     custom_item_group(frm, cdt, cdn) {
//         const row = locals[cdt][cdn];

//         row.custom_item_code = null;
//         row.model = null;
//         row.type = null;
//         row.capacity = null;

//         frm.set_query(
//             "custom_item_code",
//             "custom_customer_installed_assets",
//             function () {
//                 return {
//                     filters: {
//                         asset_group: row.custom_item_group
//                     }
//                 };
//             }
//         );
//     },

//     // ------------------------------------
//     // ASSET ITEM → MODEL
//     // ------------------------------------
//     custom_item_code(frm, cdt, cdn) {
//         const row = locals[cdt][cdn];

//         row.model = null;
//         row.type = null;
//         row.capacity = null;

//         frm.set_query(
//             "model",
//             "custom_customer_installed_assets",
//             function () {
//                 return {
//                     filters: {
//                         asset_item: row.custom_item_code
//                     }
//                 };
//             }
//         );
//     },

//     // ------------------------------------
//     // MODEL → SPEC (TYPE + CAPACITY)
//     // ------------------------------------
//     model(frm, cdt, cdn) {
//         const row = locals[cdt][cdn];

//         row.type = null;
//         row.capacity = null;

//         frm.set_query(
//             "type",
//             "custom_customer_installed_assets",
//             function () {
//                 return {
//                     filters: {
//                         asset_model: row.model
//                     }
//                 };
//             }
//         );
//     }

// });



frappe.ui.form.on("Customer Installed Asset", {

    // ASSET GROUP → ASSET ITEM
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

    // ASSET ITEM → MODEL
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

    // MODEL → SPEC (TYPE + CAPACITY)
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
