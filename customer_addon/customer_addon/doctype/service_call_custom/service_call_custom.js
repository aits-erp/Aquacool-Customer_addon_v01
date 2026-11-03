// frappe.ui.form.on("Service Call Custom", {

//     // 🔹 SERVICE NO QUERY
//     setup(frm) {
//         frm.set_query("service_no", function () {
//             return {
//                 query: "customer_addon.customer_addon.doctype.service_call_custom.service_call_custom.get_service_no"
//             };
//         });
//     },

//     // 🔹 BUTTONS
//     refresh(frm) {

//         console.log("🔥 BUTTON LOADED");

//         // duplicate buttons avoid
//         frm.clear_custom_buttons();

//         // ✅ Check In
//         frm.add_custom_button("Check In", () => {
//             handleLocation(frm, "check_in");
//         });

//         // ✅ Check Out
//         frm.add_custom_button("Check Out", () => {
//             handleLocation(frm, "check_out");
//         });
//     },

//     // 🔹 FETCH SERVICE DATA
//     service_no(frm) {

//         if (!frm.doc.service_no) return;

//         frappe.call({
//             method: "customer_addon.customer_addon.doctype.service_call_custom.service_call_custom.get_service_details",
//             args: {
//                 service_no: frm.doc.service_no
//             },
//             callback: function (r) {

//                 if (!r.message || !r.message.items) {
//                     frappe.msgprint("No data found");
//                     return;
//                 }

//                 let data = r.message;

//                 frm.set_value("custom_service_no_display", data.service_no_display || "");
//                 frm.set_value("customer", data.customer || "");
//                 frm.set_value("location", data.location || "");

//                 // 🔥 TABLE RESET
//                 frm.clear_table("custom_items");

//                 data.items.forEach(d => {

//                     if (!d.item_code) return; // safety

//                     let row = frm.add_child("custom_items");

//                     row.item_code = d.item_code;
//                     row.serial_no = d.serial_no || "";
//                     row.start_date = d.start_date || "";

//                 });

//                 frm.refresh_field("custom_items");
//             }
//         });
//     }
// });


// // 📍 MAIN LOCATION FUNCTION
// function handleLocation(frm, type) {

//     if (!navigator.geolocation) {
//         frappe.msgprint("❌ Geolocation not supported");
//         return;
//     }

//     navigator.geolocation.getCurrentPosition(

//         function(position) {

//             let lat = position.coords.latitude;
//             let lon = position.coords.longitude;
//             let now = frappe.datetime.now_datetime();

//             // ✅ CHECK IN
//             if (type === "check_in") {

//                 if (frm.doc.check_in_time) {
//                     frappe.msgprint("⚠️ Already Checked In");
//                     return;
//                 }

//                 frm.set_value("check_in_time", now);
//                 frm.set_value("check_in_latitude", lat);
//                 frm.set_value("check_in_longitude", lon);

//                 frappe.msgprint("✅ Check In Done");
//             }

//             // ✅ CHECK OUT
//             if (type === "check_out") {

//                 if (!frm.doc.check_in_time) {
//                     frappe.msgprint("❌ Please Check In first");
//                     return;
//                 }

//                 if (frm.doc.check_out_time) {
//                     frappe.msgprint("⚠️ Already Checked Out");
//                     return;
//                 }

//                 frm.set_value("check_out_time", now);
//                 frm.set_value("check_out_latitude", lat);
//                 frm.set_value("check_out_longitude", lon);

//                 frappe.msgprint("✅ Check Out Done");
//             }

//             frm.save(); // auto save

//         },

//         function(error) {

//             if (error.code === 1) {
//                 frappe.msgprint("❌ Please allow location access");
//             } else if (error.code === 2) {
//                 frappe.msgprint("❌ Location not available");
//             } else if (error.code === 3) {
//                 frappe.msgprint("❌ Location timeout");
//             } else {
//                 frappe.msgprint("❌ Unknown location error");
//             }
//         }
//     );
// }



// # original code with new structure and comments

// frappe.ui.form.on("Service Call Custom", {

//     // ======================================================
//     // SETUP
//     // ======================================================

//     setup(frm) {
//         setup_service_no_search(frm);
//     },

//     // ======================================================
//     // BUTTONS
//     // ======================================================

//     refresh(frm) {

//         console.log("SERVICE CALL CUSTOM JS LOADED");

//         frm.clear_custom_buttons();

//         frm.add_custom_button("Check In", () => {
//             handleLocation(frm, "check_in");
//         });

//         frm.add_custom_button("Check Out", () => {
//             handleLocation(frm, "check_out");
//         });

//         // Initialize Service No autocomplete
//         setup_service_no_search(frm);
//     },

//     // ======================================================
//     // SERVICE NO CHANGE
//     // ======================================================

//     service_no(frm) {

//         if (!frm.doc.service_no) {
//             return;
//         }

//         fetch_service_details(frm, frm.doc.service_no);
//     }
// });


// // ==========================================================
// // SERVICE NUMBER AUTOCOMPLETE
// // ==========================================================

// function setup_service_no_search(frm) {

//     let field = frm.fields_dict.service_no;

//     if (!field || !field.$input || field.service_search_initialized) {
//         return;
//     }

//     let input = field.$input[0];

//     if (!input || !window.Awesomplete) {
//         console.warn("Service No autocomplete is unavailable");
//         return;
//     }

//     field.service_search_initialized = true;

//     let awesomplete = new Awesomplete(input, {
//         minChars: 1,
//         maxItems: 20,
//         autoFirst: false
//     });

//     let search_timeout;

//     $(input).on("input", function () {

//         clearTimeout(search_timeout);

//         let txt = this.value.trim();

//         if (!txt) {
//             return;
//         }

//         search_timeout = setTimeout(() => {

//             frappe.call({

//                 method: "customer_addon.customer_addon.doctype.service_call_custom.service_call_custom.search_service_numbers",

//                 args: {
//                     txt: txt,
//                     start: 0,
//                     page_len: 50
//                 },

//                 callback: function (r) {

//                     let results = r.message || [];

//                     awesomplete.list = results.map(d => ({
//                         label: `${d.service_no} | ${d.customer || ""} | ${d.location || ""}`,
//                         value: d.service_no
//                     }));

//                 }
//             });

//         }, 300);
//     });

//     input.addEventListener("awesomplete-selectcomplete", function (event) {

//         let selected_service_no = event.text.value;

//         frm.set_value("service_no", selected_service_no);

//         fetch_service_details(frm, selected_service_no);
//     });
// }


// // ==========================================================
// // FETCH SERVICE DETAILS
// // ==========================================================

// function fetch_service_details(frm, service_no) {

//     frappe.call({

//         method: "customer_addon.customer_addon.doctype.service_call_custom.service_call_custom.get_service_details",

//         args: {
//             service_no: service_no
//         },

//         freeze: true,
//         freeze_message: "Fetching Service Details...",

//         callback: function (r) {

//             if (!r.message || !r.message.items) {
//                 frappe.msgprint("No service details found");
//                 return;
//             }

//             let data = r.message;

//             // ----------------------------------------------
//             // FETCH PARENT DETAILS
//             // ----------------------------------------------

//             frm.set_value("customer", data.customer || "");
//             frm.set_value("location", data.location || "");

//             // ----------------------------------------------
//             // CLEAR EXISTING CHILD TABLE
//             // ----------------------------------------------

//             frm.clear_table("custom_items");

//             // ----------------------------------------------
//             // POPULATE ALL MATCHING ASSET ROWS
//             // ----------------------------------------------

//             (data.items || []).forEach(d => {

//                 if (!d.item_code) {
//                     return;
//                 }

//                 let row = frm.add_child("custom_items");

//                 row.item_code = d.item_code || "";
//                 row.serial_no = d.serial_no || "";
//                 row.description = d.description || "";
//                 row.start_date = d.start_date || "";

//                 row.location = d.location || "";
//                 row.sub_location = d.sub_location || "";
//                 row.address = d.address || "";

//                 row.item_group = d.item_group || "";
//                 row.model = d.model || "";
//                 row.type = d.type || "";
//                 row.capacity = d.capacity || "";

//                 row.amc = d.amc || "";
//                 row.end_date = d.end_date || "";

//                 row.warranty = d.warranty || "";
//                 row.warranty_date = d.warranty_date || "";

//             });

//             frm.refresh_field("custom_items");

//             frappe.show_alert({
//                 message: `${data.items.length} asset row(s) fetched successfully`,
//                 indicator: "green"
//             });

//         }
//     });
// }


// // ==========================================================
// // CHECK IN / CHECK OUT GPS FUNCTION
// // EXISTING FUNCTIONALITY PRESERVED
// // ==========================================================

// function handleLocation(frm, type) {

//     if (!navigator.geolocation) {
//         frappe.msgprint("Geolocation not supported");
//         return;
//     }

//     navigator.geolocation.getCurrentPosition(

//         function(position) {

//             let lat = position.coords.latitude;
//             let lon = position.coords.longitude;
//             let now = frappe.datetime.now_datetime();

//             // ----------------------------------------------
//             // CHECK IN
//             // ----------------------------------------------

//             if (type === "check_in") {

//                 if (frm.doc.check_in_time) {
//                     frappe.msgprint("Already Checked In");
//                     return;
//                 }

//                 frm.set_value("check_in_time", now);
//                 frm.set_value("check_in_latitude", lat);
//                 frm.set_value("check_in_longitude", lon);

//                 frappe.msgprint("Check In Done");
//             }

//             // ----------------------------------------------
//             // CHECK OUT
//             // ----------------------------------------------

//             if (type === "check_out") {

//                 if (!frm.doc.check_in_time) {
//                     frappe.msgprint("Please Check In first");
//                     return;
//                 }

//                 if (frm.doc.check_out_time) {
//                     frappe.msgprint("Already Checked Out");
//                     return;
//                 }

//                 frm.set_value("check_out_time", now);
//                 frm.set_value("check_out_latitude", lat);
//                 frm.set_value("check_out_longitude", lon);

//                 frappe.msgprint("Check Out Done");
//             }

//             // Auto save
//             frm.save();

//         },

//         function(error) {

//             if (error.code === 1) {
//                 frappe.msgprint("Please allow location access");
//             }
//             else if (error.code === 2) {
//                 frappe.msgprint("Location not available");
//             }
//             else if (error.code === 3) {
//                 frappe.msgprint("Location timeout");
//             }
//             else {
//                 frappe.msgprint("Unknown location error");
//             }
//         }
//     );
// }



frappe.ui.form.on("Service Call Custom", {

    // ======================================================
    // SETUP
    // ======================================================

    setup(frm) {
        setup_service_no_search(frm);
    },
    
    // AUTO-FILL TECHNICIAN
    onload(frm) {
        if (frm.is_new() && !frm.doc.technician) {
            const df = frm.fields_dict.technician?.df;

            if (df?.fieldtype === "Link" && df.options === "User") {
                frm.set_value("technician", frappe.session.user);
            } else {
                frm.set_value(
                    "technician",
                    frappe.session.user_fullname || frappe.session.user
                );
            }
        }
    },
    // ======================================================
    // BUTTONS
    // ======================================================

    refresh(frm) {

        console.log("SERVICE CALL CUSTOM JS LOADED");

        frm.clear_custom_buttons();

        frm.add_custom_button("Check In", () => {
            handleLocation(frm, "check_in");
        });

        frm.add_custom_button("Check Out", () => {
            handleLocation(frm, "check_out");
        });

        // Initialize Service No autocomplete
        setup_service_no_search(frm);
    },

    // ======================================================
    // SERVICE NO CHANGE
    // ======================================================

//     service_no(frm) {

//         if (!frm.doc.service_no) {
//             return;
//         }

//         fetch_service_details(frm, frm.doc.service_no);
//     }
// });


service_no(frm) {

    if (!frm.doc.service_no) {
        return;
    }

    if (frm._selected_service_no !== frm.doc.service_no) {
        return;
    }

    fetch_service_details(frm, frm.doc.service_no);

    frm._selected_service_no = null;
}
});


// ==========================================================
// SERVICE NUMBER AUTOCOMPLETE
// ==========================================================

function setup_service_no_search(frm) {

    let field = frm.fields_dict.service_no;

    if (!field || !field.$input || field.service_search_initialized) {
        return;
    }

    let input = field.$input[0];

    if (!input || !window.Awesomplete) {
        console.warn("Service No autocomplete is unavailable");
        return;
    }

    field.service_search_initialized = true;

    let awesomplete = new Awesomplete(input, {
        minChars: 1,
        maxItems: 20,
        autoFirst: false
    });

    let search_timeout;

    $(input).on("input", function () {

        clearTimeout(search_timeout);

        let txt = this.value.trim();

        if (!txt) {
            return;
        }

        search_timeout = setTimeout(() => {

            frappe.call({

                method: "customer_addon.customer_addon.doctype.service_call_custom.service_call_custom.search_service_numbers",

                args: {
                    txt: txt,
                    start: 0,
                    page_len: 50
                },

                callback: function (r) {

                    let results = r.message || [];

                    awesomplete.list = results.map(d => ({
                        label: `${d.service_no} | ${d.customer || ""} | ${d.location || ""}`,
                        value: d.service_no
                    }));

                }
            });

        }, 300);
    });

    // input.addEventListener("awesomplete-selectcomplete", function (event) {

    //     let selected_service_no = event.text.value;

    //     // Setting the value triggers the service_no event.
    //     // Do not call fetch_service_details separately here.
    //     frm.set_value("service_no", selected_service_no);

    // });

        input.addEventListener("awesomplete-selectcomplete", function (event) {

        let selected_service_no = event.text.value;

        frm._selected_service_no = selected_service_no;

        frm.set_value("service_no", selected_service_no);

    });
}


// ==========================================================
// FETCH SERVICE DETAILS
// ==========================================================

function fetch_service_details(frm, service_no) {

    frappe.call({

        method: "customer_addon.customer_addon.doctype.service_call_custom.service_call_custom.get_service_details",

        args: {
            service_no: service_no
        },

        freeze: true,
        freeze_message: "Fetching Service Details...",

        callback: function (r) {

            if (!r.message || !r.message.items) {
                frappe.msgprint("No service details found");
                return;
            }

            let data = r.message;

            // ----------------------------------------------
            // FETCH PARENT DETAILS
            // ----------------------------------------------

            frm.set_value("custom_service_no_display", data.service_no_display || data.service_no || "");
            frm.set_value("customer", data.customer || "");
            frm.set_value("location", data.location || "");

            // ----------------------------------------------
            // CLEAR EXISTING CHILD TABLE
            // ----------------------------------------------

            frm.clear_table("custom_items");

            // ----------------------------------------------
            // POPULATE ALL MATCHING ASSET ROWS
            // ----------------------------------------------

            (data.items || []).forEach(d => {

                if (!d.item_code) {
                    return;
                }

                let row = frm.add_child("custom_items");

                row.item_code = d.item_code || "";
                row.serial_no = d.serial_no || "";
                row.description = d.description || "";
                row.start_date = d.start_date || "";

                row.location = d.location || "";
                row.sub_location = d.sub_location || "";
                row.address = d.address || "";

                row.item_group = d.item_group || "";
                row.model = d.model || "";
                row.type = d.type || "";
                row.capacity = d.capacity || "";

                row.amc = d.amc || "";
                row.end_date = d.end_date || "";

                row.warranty = d.warranty || "";
                row.warranty_date = d.warranty_date || "";

            });

            frm.refresh_field("custom_items");

            frappe.show_alert({
                message: `${data.items.length} asset row(s) fetched successfully`,
                indicator: "green"
            });

        }
    });
}


// ==========================================================
// CHECK IN / CHECK OUT GPS FUNCTION
// EXISTING FUNCTIONALITY PRESERVED
// ==========================================================

function handleLocation(frm, type) {

    if (!navigator.geolocation) {
        frappe.msgprint("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(

        function(position) {

            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            let now = frappe.datetime.now_datetime();

            // ----------------------------------------------
            // CHECK IN
            // ----------------------------------------------

            if (type === "check_in") {

                if (frm.doc.check_in_time) {
                    frappe.msgprint("Already Checked In");
                    return;
                }

                frm.set_value("check_in_time", now);
                frm.set_value("check_in_latitude", lat);
                frm.set_value("check_in_longitude", lon);

                frappe.msgprint("Check In Done");
            }

            // ----------------------------------------------
            // CHECK OUT
            // ----------------------------------------------

            if (type === "check_out") {

                if (!frm.doc.check_in_time) {
                    frappe.msgprint("Please Check In first");
                    return;
                }

                if (frm.doc.check_out_time) {
                    frappe.msgprint("Already Checked Out");
                    return;
                }

                frm.set_value("check_out_time", now);
                frm.set_value("check_out_latitude", lat);
                frm.set_value("check_out_longitude", lon);

                frappe.msgprint("Check Out Done");
            }

            // Auto save
            frm.save();

        },

        function(error) {

            if (error.code === 1) {
                frappe.msgprint("Please allow location access");
            }
            else if (error.code === 2) {
                frappe.msgprint("Location not available");
            }
            else if (error.code === 3) {
                frappe.msgprint("Location timeout");
            }
            else {
                frappe.msgprint("Unknown location error");
            }
        }
    );
}

