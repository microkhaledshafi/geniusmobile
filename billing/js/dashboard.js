/* ==========================================================
   Genius Scientific ERP
   dashboard.js
   Part 1
========================================================== */

import {

    getDashboardSummary,
    getTodaySales,
    getMonthlySales,
    getRecentInvoices

} from "./api.js";

let initialized = false;

let elements = {};

/* ==========================================================
   Initialize
========================================================== */

export async function initializeDashboard() {

    if (initialized)
        return;

    cacheElements();

    initialized = true;

    await refreshDashboard();

    console.log(

        "[Dashboard] Initialized"

    );

}

/* ==========================================================
   Cache Elements
========================================================== */

function cacheElements() {

    elements.totalInvoices =
        document.getElementById("dashboardTotalInvoices");

    elements.todaySales =
        document.getElementById("dashboardTodaySales");

    elements.monthlySales =
        document.getElementById("dashboardMonthlySales");

    elements.totalCustomers =
        document.getElementById("dashboardTotalCustomers");

    elements.recentInvoices =
        document.getElementById("dashboardRecentInvoices");

}

/* ==========================================================
   Refresh Dashboard
========================================================== */

export async function refreshDashboard() {

    try {

        const summary = await getDashboardSummary();

        const today = await getTodaySales();

        const month = await getMonthlySales();

        const recent = await getRecentInvoices();

        renderDashboard(

            summary,
            today,
            month,
            recent

        );

    }

    catch (error) {

        console.error(

            "[Dashboard]",

            error

        );

    }

}

/* ==========================================================
   Render Dashboard
========================================================== */

function renderDashboard(
    summary = {},
    today = {},
    month = {},
    recent = []
) {

    if (elements.totalInvoices) {

        elements.totalInvoices.textContent =
            summary.totalInvoices ?? 0;

    }

    if (elements.totalCustomers) {

        elements.totalCustomers.textContent =
            summary.totalCustomers ?? 0;

    }

    if (elements.todaySales) {

        elements.todaySales.textContent =
            formatCurrency(
                today.totalSales ?? 0
            );

    }

    if (elements.monthlySales) {

        elements.monthlySales.textContent =
            formatCurrency(
                month.totalSales ?? 0
            );

    }

    renderRecentInvoices(recent);

}

/* ==========================================================
   Render Recent Invoices
========================================================== */

function renderRecentInvoices(invoices = []) {

    if (!elements.recentInvoices)
        return;

    elements.recentInvoices.innerHTML = "";

    if (!invoices.length) {

        elements.recentInvoices.innerHTML = `

            <tr>

                <td colspan="4"
                    class="text-center text-muted">

                    No recent invoices

                </td>

            </tr>

        `;

        return;

    }

    invoices.forEach(invoice => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${invoice.invoice_number}</td>

            <td>${invoice.customer_name ?? ""}</td>

            <td class="text-end">

                ${formatCurrency(
                    invoice.grand_total ?? 0
                )}

            </td>

            <td>

                ${invoice.invoice_date}

            </td>

        `;

        elements.recentInvoices.appendChild(row);

    });

}

/* ==========================================================
   Format Currency
========================================================== */

function formatCurrency(value) {

    return Number(value || 0).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}

/* ==========================================================
   Clear Dashboard
========================================================== */

export function clearDashboard() {

    renderDashboard(
        {},
        {},
        {},
        []
    );

}

/* ==========================================================
   Destroy Dashboard
========================================================== */

export function destroyDashboard() {

    clearDashboard();

    elements = {};

    initialized = false;

}

/* ==========================================================
   Dashboard Status
========================================================== */

export function isDashboardInitialized() {

    return initialized;

}

/* ==========================================================
   Default Export
========================================================== */

export default {

    initializeDashboard,

    refreshDashboard,

    clearDashboard,

    destroyDashboard,

    isDashboardInitialized

};
