frappe.ui.form.on("Service Call Custom", {

    refresh(frm) {

        // 🔘 Check In Button
        frm.add_custom_button("Check In", () => {
            handleLocation(frm, "check_in");
        });

        // 🔘 Check Out Button
        frm.add_custom_button("Check Out", () => {
            handleLocation(frm, "check_out");
        });
    }
});


// 📍 MAIN FUNCTION
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

            frm.save(); // auto save

        },
        function(error) {
            frappe.msgprint("❌ Please allow location access");
        }
    );
}
function getLocationAndSet(frm, type) {

    if (!navigator.geolocation) {
        frappe.msgprint("Geolocation not supported ❌");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(position) {

            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            if (type === "check_in") {
                frm.set_value("check_in_time", frappe.datetime.now_datetime());
                frm.set_value("check_in_latitude", lat);
                frm.set_value("check_in_longitude", lon);
            }

            if (type === "check_out") {
                frm.set_value("check_out_time", frappe.datetime.now_datetime());
                frm.set_value("check_out_latitude", lat);
                frm.set_value("check_out_longitude", lon);
            }

            frappe.msgprint("✅ Location Captured");

        },
        function() {
            frappe.msgprint("❌ Allow location access");
        }
    );
}