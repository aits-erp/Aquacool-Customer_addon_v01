frappe.ui.form.on('Custom Service Item', {
    refresh(frm) {
        check_follow_up(frm);
    },
    status(frm) {
        check_follow_up(frm);
    }
});

function check_follow_up(frm) {
    console.log("STATUS:", frm.doc.status); // debug

    if (frm.doc.status === "Follow Up") {
        frm.toggle_display('follow_up', true);
        frm.set_df_property('follow_up', 'reqd', 1);
    } else {
        frm.toggle_display('follow_up', false);
        frm.set_df_property('follow_up', 'reqd', 0);
    }
}