// // // Copyright (c) 2026, aits and contributors
// // // For license information, please see license.txt

// frappe.query_reports["Visit Count Report"] = {
//     filters: [
//         {
//             fieldname: "from_date",
//             label: __("From Date"),
//             fieldtype: "Date",
//             reqd: 1
//         },
//         {
//             fieldname: "to_date",
//             label: __("To Date"),
//             fieldtype: "Date",
//             reqd: 1
//         },
//         {
//             fieldname: "employee",
//             label: __("Employee"),
//             fieldtype: "Link",
//             options: "User"
//         }
//     ],

//     formatter: function(value, row, column, data, default_formatter) {
//         value = default_formatter(value, row, column, data);

//         if (column.fieldname === "visit_count" && data && data.visit_count) {
//             let filters = {
//                 visited_by: data.employee,
//                 visit_datetime: ["between", [data.visit_date, data.visit_date]]
//             };

//             let route = `/app/customer-visit-report/view/list?filters=${encodeURIComponent(JSON.stringify(filters))}`;

//             value = `<a href="${route}" target="_blank">${data.visit_count}</a>`;
//         }

//         return value;
//     }
// };




frappe.query_reports["Visit Count Report"] = {
    filters: [
        {
            fieldname: "from_date",
            label: __("From Date"),
            fieldtype: "Date",
            reqd: 1
        },
        {
            fieldname: "to_date",
            label: __("To Date"),
            fieldtype: "Date",
            reqd: 1
        },
        {
            fieldname: "employee",
            label: __("Employee"),
            fieldtype: "Link",
            options: "User"
        }
    ],

    formatter: function(value, row, column, data, default_formatter) {
        value = default_formatter(value, row, column, data);

        if (column.fieldname === "visit_count" && data && data.visit_count) {

            let visit_date = data.visit_date;
            let employee = data.employee;

            value = `
                <a href="#"
                   style="color:#2490ef; font-weight:600;"
                   onclick='
                        frappe.route_options = {
                            "visited_by": "${employee}",
                            "visit_datetime": ["between", ["${visit_date} 00:00:00", "${visit_date} 23:59:59"]]
                        };
                        frappe.set_route("List", "Customer Visit Report");
                        return false;
                   '>
                    ${data.visit_count}
                </a>
            `;
        }

        return value;
    }
};