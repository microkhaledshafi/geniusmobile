/* ==========================================================
   Genius Scientific ERP
   editInvoice.js
   Part 1
========================================================== */

import { state } from "./state.js";

import {

    getInvoice,

    getInvoiceItems

} from "./api.js";

import {

    loadInvoiceData

} from "./invoice.js";

import {

    loadCustomerData

} from "./customer.js";

import {

    loadInvoiceItems

} from "./invoiceTable.js";

import {

    loadPayment

} from "./payment.js";

import {

    refreshInvoiceCalculations

} from "./calculations.js";

let initialized = false;

/* ==========================================================
   Initialize
========================================================== */

export function initializeEditInvoice() {

    if (initialized) return;

    initialized = true;

    console.log("[Edit Invoice] Initialized");

}

/* ==========================================================
   Edit Invoice
========================================================== */

export async function editInvoice(invoiceId) {

    if (!invoiceId)
        return;

    try {

        await loadInvoice(invoiceId);

    }

    catch (error) {

        console.error(

            "[Edit Invoice]",

            error

        );

        throw error;

    }

}

/* ==========================================================
   Load Invoice
========================================================== */

async function loadInvoice(invoiceId) {

    const invoice = await getInvoice(invoiceId);

    if (!invoice)
        return;

    const items = await getInvoiceItems(invoiceId);

    populateInvoice(invoice, items);

}

/* ==========================================================
   Populate Invoice
========================================================== */

function populateInvoice(invoice, items = []) {

    /* ------------------------------------------
       Store Current Invoice
    ------------------------------------------ */

    state.currentInvoice = invoice;

    state.invoiceItems = Array.isArray(items)
        ? items
        : [];

    /* ------------------------------------------
       Invoice Header
    ------------------------------------------ */

    loadInvoiceData(invoice);

    /* ------------------------------------------
       Customer
    ------------------------------------------ */

    loadCustomerData(invoice);

    /* ------------------------------------------
       Invoice Items
    ------------------------------------------ */

    loadInvoiceItems(state.invoiceItems);

    /* ------------------------------------------
       Payment
    ------------------------------------------ */

    loadPayment(invoice);

    /* ------------------------------------------
       Calculations
    ------------------------------------------ */

    refreshInvoiceCalculations();

    console.log(

        "[Edit Invoice] Invoice loaded",

        invoice.invoice_number

    );

}

/* ==========================================================
   Current Invoice
========================================================== */

export function getEditingInvoice() {

    return state.currentInvoice;

}

/* ==========================================================
   Editing Status
========================================================== */

export function isEditing() {

    return !!state.currentInvoice;

}

/* ==========================================================
   Reset Editing
========================================================== */

export function resetEditing() {

    state.currentInvoice = null;

    state.invoiceItems = [];

}

/* ==========================================================
   Editing Invoice Id
========================================================== */

export function getEditingInvoiceId() {

    return state.currentInvoice
        ? state.currentInvoice.id
        : null;

}

/* ==========================================================
   Reload Current Invoice
========================================================== */

export async function reloadEditingInvoice() {

    const invoiceId = getEditingInvoiceId();

    if (!invoiceId)
        return;

    await editInvoice(invoiceId);

}

/* ==========================================================
   Close Edit
========================================================== */

export function closeEditing() {

    resetEditing();

}

/* ==========================================================
   Destroy
========================================================== */

export function destroyEditInvoice() {

    resetEditing();

    initialized = false;

}

/* ==========================================================
   Default Export
========================================================== */

export default {

    initializeEditInvoice,

    editInvoice,

    reloadEditingInvoice,

    getEditingInvoice,

    getEditingInvoiceId,

    isEditing,

    closeEditing,

    resetEditing,

    destroyEditInvoice

};
