/* ==========================================================
   Genius Scientific ERP
   dashboard.js
   Dashboard Module
========================================================== */

let initialized = false;

/* ==========================================================
   Initialize Dashboard
========================================================== */

export async function initializeDashboard() {

    if (initialized) return;

    initialized = true;

    refreshDashboard();

    console.log("[Dashboard] Initialized");

}

/* ==========================================================
   Refresh Dashboard
========================================================== */

export function refreshDashboard() {

    updateCard("todaySales", "0.00");
    updateCard("todayInvoices", "0");
    updateCard("totalCustomers", "0");
    updateCard("pendingAmount", "0.00");

}

/* ==========================================================
   Update Dashboard Card
========================================================== */

export function updateCard(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}

/* ==========================================================
   Reset Dashboard
========================================================== */

export function resetDashboard() {

    refreshDashboard();

}

/* ==========================================================
   Public API
========================================================== */

export default {

    initializeDashboard,
    refreshDashboard,
    updateCard,
    resetDashboard

};
