frappe.ui.form.on("Service Call Custom", {

    setup(frm) {
        frm.set_query("service_no", function () {
            return {
                query: "customer_addon.customer_addon.doctype.service_call_custom.service_call_custom.get_service_no"
            };
        });
    },

    refresh(frm) {

        frm.clear_custom_buttons();

        // ✅ CHECK IN
        frm.add_custom_button("Check In", () => {
            handleLocation(frm, "check_in");
        });

        // ✅ CHECK OUT
        frm.add_custom_button("Check Out", () => {
            handleLocation(frm, "check_out");
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

                if (!r.message || !r.message.items) {
                    frappe.msgprint("No data found");
                    return;
                }

                let data = r.message;

                frm.set_value("custom_service_no_display", data.service_no_display || "");
                frm.set_value("customer", data.customer || "");
                frm.set_value("location", data.location || "");

                frm.clear_table("custom_items");

                data.items.forEach(d => {

                    if (!d.item_code) return;

                    let row = frm.add_child("custom_items");

                    row.item_code = d.item_code;
                    row.serial_no = d.serial_no || "";
                    row.start_date = d.start_date || "";

                });

                frm.refresh_field("custom_items");
            }
        });
    }
});


// 📍 LOCATION HANDLER
function handleLocation(frm, type) {

    if (!navigator.geolocation) {
        frappe.msgprint("❌ Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(

        function(position) {

            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            let now = frappe.datetime.now_datetime();

            // ✅ CHECK IN
            if (type === "check_in") {

                if (frm.doc.check_in_time) {
                    frappe.msgprint("⚠️ Already Checked In");
                    return;
                }

                frm.set_value("check_in_time", now);
                frm.set_value("check_in_latitude", lat);
                frm.set_value("check_in_longitude", lon);

                frappe.msgprint("✅ Check In Done");
            }

            // ✅ CHECK OUT
            if (type === "check_out") {

                if (!frm.doc.check_in_time) {
                    frappe.msgprint("❌ Please Check In first");
                    return;
                }

                if (frm.doc.check_out_time) {
                    frappe.msgprint("⚠️ Already Checked Out");
                    return;
                }

                frm.set_value("check_out_time", now);
                frm.set_value("check_out_latitude", lat);
                frm.set_value("check_out_longitude", lon);

                frappe.msgprint("✅ Check Out Done");
            }

            frm.save();

        },

        function(error) {

            if (error.code === 1) {
                frappe.msgprint("❌ Please allow location access");
            } else {
                frappe.msgprint("❌ Location error");
            }
        }
    );
}