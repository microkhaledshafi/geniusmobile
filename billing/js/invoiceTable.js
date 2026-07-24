/* ==========================================================
   Genius Scientific ERP
   invoiceTable.js
========================================================== */

let initialized = false;
const invoiceItems = [];

/* ==========================================================
   Initialize
========================================================== */

export function initializeInvoiceTable() {

    if (initialized) return;

    initialized = true;

    console.log("[Invoice Table] Initialized");

}

/* ==========================================================
   Items
========================================================== */

export function getInvoiceItems() {
    return invoiceItems;
}

export function setInvoiceItems(items = []) {
    invoiceItems.length = 0;
    invoiceItems.push(...items);
}

export function addInvoiceItem(item = {}) {
    invoiceItems.push(item);
}

export function removeInvoiceItem(index) {
    if (index >= 0 && index < invoiceItems.length) {
        invoiceItems.splice(index, 1);
    }
}

export function clearInvoiceItems() {
    invoiceItems.length = 0;
}

/* ==========================================================
   Public API
========================================================== */

export default {

    initializeInvoiceTable,
    getInvoiceItems,
    setInvoiceItems,
    addInvoiceItem,
    removeInvoiceItem,
    clearInvoiceItems

};
