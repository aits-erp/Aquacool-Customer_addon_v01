
// frappe.ui.form.on("Issue", {
//     refresh(frm) {
//         if (frm.is_new()) {
//             return;
//         }

//         frm.add_custom_button(
//             __("Service Call Custom"),
//             function () {
//                 frappe.new_doc("Service Call Custom", {
//                     customer: frm.doc.customer || "",
//                     custom_subject: frm.doc.subject || "",
//                     custom_description: frm.doc.description || "",
//                     custom_issue: frm.doc.name
//                 });
//             },
//             __("Create")
//         );
//     }
// });



frappe.ui.form.on("Issue", {
    refresh(frm) {
        if (frm.is_new()) {
            return;
        }

        frm.add_custom_button(
            __("Service Call Custom"),
            function () {
                frappe.new_doc("Service Call Custom", {
                    subject: frm.doc.subject || "",
                    description: frm.doc.description || "",
                    customer: frm.doc.customer || "",
                    issue: frm.doc.name
                });
            },
            __("Create")
        );
    }
});
