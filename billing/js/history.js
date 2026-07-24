/* ==========================================================
   Genius Scientific ERP
   history.js
   Invoice History Module
========================================================== */

let initialized = false;

let invoiceHistory = [];

/* ==========================================================
   Initialize
========================================================== */

export async function initializeHistory() {

    if (initialized) return;

    initialized = true;

    console.log("[History] Initialized");

}

/* ==========================================================
   Set History
========================================================== */

export function setHistory(data = []) {

    invoiceHistory = Array.isArray(data) ? data : [];

}

/* ==========================================================
   Get History
========================================================== */

export function getHistory() {

    return invoiceHistory;

}

/* ==========================================================
   Clear History
========================================================== */

export function clearHistory() {

    invoiceHistory = [];

}

/* ==========================================================
   Refresh History
========================================================== */

export async function refreshHistory() {

    console.log("[History] Refresh");

}

/* ==========================================================
   Public API
========================================================== */

export default {

    initializeHistory,
    refreshHistory,
    getHistory,
    setHistory,
    clearHistory

};
