frappe.ui.form.on('Customer Visit Report', {

    onload(frm) {
        if (!frm.doc.visited_by) {
            frm.set_value("visited_by", frappe.session.user);
        }
    },

    refresh(frm) {
        control_buttons(frm);
    },

    // checkin(frm) {
    //     if (frm.doc.check_in_date_and_time) {
    //         frappe.msgprint("Already Checked In");
    //         return;
    //     }

    //     if (frm.is_new()) {
    //         frappe.msgprint("Please Save document before Checkin.");
    //         return;
    //     }

    //     frm.set_value("check_in_date_and_time", frappe.datetime.now_datetime());
    //     frm.save();
    // },

    checkin(frm) {
        if (!frm.doc.longitude) {
            frappe.msgprint("Please fetch location before Checkin.");
            return;
        }

        if (frm.doc.check_in_date_and_time) {
            frappe.msgprint("Already Checked In");
            return;
        }

        if (frm.is_new()) {
            frappe.msgprint("Please Save document before Checkin.");
            return;
        }

        frm.set_value("check_in_date_and_time", frappe.datetime.now_datetime());
        frm.save();
    },

    checkout(frm) {
        if (!frm.doc.check_in_date_and_time) {
            frappe.msgprint("Cannot Checkout without Checkin.");
            return;
        }

        if (frm.doc.check_out_date_and_time) {
            frappe.msgprint("Already Checked Out");
            return;
        }

        frm.set_value("check_out_date_and_time", frappe.datetime.now_datetime());
        frm.save();
    },

    get_location(frm) {

    if (!navigator.geolocation) {
        frappe.msgprint("Geolocation is not supported by this browser.");
        return;
    }

    frappe.msgprint("Fetching location... Please allow GPS access.");

    navigator.geolocation.getCurrentPosition(
        function(position) {

            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            // Round for clean display (6 decimal precision is professional standard)
            lat = parseFloat(lat.toFixed(6));
            lon = parseFloat(lon.toFixed(6));

            // Set visible fields
            frm.set_value("latitude", lat);
            frm.set_value("longitude", lon);

            // Build GeoJSON
            let geo_json = {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "Point",
                            "coordinates": [lon, lat]   // IMPORTANT ORDER
                        }
                    }
                ]
            };

            frm.set_value("location", JSON.stringify(geo_json));

            frm.refresh_field("latitude");
            frm.refresh_field("longitude");
            frm.refresh_field("location");

            frappe.msgprint("Location Captured Successfully");

        },
        function(error) {
            frappe.msgprint("Unable to fetch location. Please allow location access.");
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

});


function control_buttons(frm) {

    if (!frm.doc.check_in_date_and_time) {
        frm.set_df_property("checkin", "hidden", 0);
        frm.set_df_property("checkout", "hidden", 1);
    }

    else if (frm.doc.check_in_date_and_time && !frm.doc.check_out_date_and_time) {
        frm.set_df_property("checkin", "hidden", 1);
        frm.set_df_property("checkout", "hidden", 0);
    }

    else {
        frm.set_df_property("checkin", "hidden", 1);
        frm.set_df_property("checkout", "hidden", 1);
    }
}