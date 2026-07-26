/* ==========================================================
   Genius Scientific ERP
   deleteInvoice.js
   Part 1
========================================================== */

import {

    deleteInvoice as deleteInvoiceAPI

} from "./api.js";

import {

    refreshHistory

} from "./history.js";

import {

    refreshDashboard

} from "./dashboard.js";

let initialized = false;

/* ==========================================================
   Initialize
========================================================== */

export function initializeDeleteInvoice() {

    if (initialized)
        return;

    initialized = true;

    console.log(

        "[Delete Invoice] Initialized"

    );

}

/* ==========================================================
   Delete Invoice
========================================================== */

export async function deleteInvoice(invoiceId) {

    if (!invoiceId)
        return false;

    try {

        await performDelete(invoiceId);

        return true;

    }

    catch (error) {

        console.error(

            "[Delete Invoice]",

            error

        );

        throw error;

    }

}

/* ==========================================================
   Perform Delete
========================================================== */

async function performDelete(invoiceId) {

    await deleteInvoiceAPI(invoiceId);

    await afterDelete();

}

/* ==========================================================
   After Delete
========================================================== */

async function afterDelete() {

    await refreshHistory();

    await refreshDashboard();

    console.log(

        "[Delete Invoice] Invoice deleted successfully"

    );

}

/* ==========================================================
   Delete Multiple Invoices
========================================================== */

export async function deleteInvoices(invoiceIds = []) {

    if (!Array.isArray(invoiceIds))
        return;

    for (const invoiceId of invoiceIds) {

        await deleteInvoice(invoiceId);

    }

}

/* ==========================================================
   Destroy
========================================================== */

export function destroyDeleteInvoice() {

    initialized = false;

}

/* ==========================================================
   Default Export
========================================================== */

export default {

    initializeDeleteInvoice,

    deleteInvoice,

    deleteInvoices,

    destroyDeleteInvoice

};
