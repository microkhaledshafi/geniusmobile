/* ==========================================================
   Genius Scientific ERP
   saveInvoice.js
   Part 1
========================================================== */

import { supabase } from "../supabase.js";

import { state } from "./state.js";

import {
    validateInvoiceHeader,
    syncInvoiceHeader
} from "./invoice.js";

import {
    syncInvoiceItems,
    getInvoiceItems
} from "./invoiceTable.js";

import {
    savePaymentState
} from "./payment.js";

import {
    getInvoiceTotals
} from "./calculations.js";

import {
    showSuccess,
    showError
} from "./notifications.js";

let initialized = false;

let btnSave = null;

/* ==========================================================
   Initialize
========================================================== */

export function initializeSaveInvoice() {

    if (initialized) return;

    initialized = true;

    btnSave =
        document.getElementById("btnSaveInvoice");

    btnSave?.addEventListener(
        "click",
        saveInvoice
    );

    console.log("[Save Invoice] Initialized");

}

/* ==========================================================
   Main Save
========================================================== */

export async function saveInvoice() {

    try {

        if (!validateBeforeSave())
            return;

        buildInvoiceState();

       await saveInvoiceHeader();

await saveInvoiceItems();

await afterSave();

showSuccess(
    "Invoice saved successfully."
);

    }

    catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Unable to save invoice."
        );

    }

}

/* ==========================================================
   Validation
========================================================== */

function validateBeforeSave() {

    if (!validateInvoiceHeader())
        return false;

    syncInvoiceItems();

    if (state.invoiceItems.length === 0) {

        showError(
            "Invoice contains no items."
        );

        return false;

    }

    return true;

}

/* ==========================================================
   Build State
========================================================== */

function buildInvoiceState() {

    syncInvoiceHeader();

    syncInvoiceItems();

    savePaymentState();

    state.totals =
        getInvoiceTotals();

}

/* ==========================================================
   Save Invoice Header
========================================================== */

async function saveInvoiceHeader() {

    const invoiceData = {

        invoice_number: state.invoice.invoiceNumber,

        invoice_date: state.invoice.invoiceDate,

        customer_id: state.customer?.id || null,

        customer_name: state.customer?.name || "",

        customer_phone: state.customer?.phone || "",

        subtotal: state.totals.subtotal,

        discount: state.totals.discount,

        tax: state.totals.tax,

        grand_total: state.totals.grandTotal,

        payment_mode: state.payment.mode,

        payment_status: state.payment.status,

        amount_received: state.payment.amountReceived,

        balance: state.payment.balance,

        change_amount: state.payment.change

    };

    /* ---------- UPDATE ---------- */

    if (state.currentInvoiceId) {

        const { error } = await supabase

            .from("invoices")

            .update(invoiceData)

            .eq("id", state.currentInvoiceId);

        if (error) throw error;

        return;

    }

    /* ---------- INSERT ---------- */

    const { data, error } = await supabase

        .from("invoices")

        .insert(invoiceData)

        .select()

        .single();

    if (error) throw error;

    state.currentInvoiceId = data.id;

}

/* ==========================================================
   Save Items
========================================================== */

async function saveInvoiceItems() {

    if (!state.currentInvoiceId)
        throw new Error("Invoice ID missing.");

    /* ---------- Editing Existing ---------- */

    if (state.editMode) {

        const { error } = await supabase

            .from("invoice_items")

            .delete()

            .eq("invoice_id", state.currentInvoiceId);

        if (error) throw error;

    }

    const rows = getInvoiceItems();

    const items = rows.map(item => ({

        invoice_id: state.currentInvoiceId,

        product_id: item.productId,

        product_name: item.productName,

        hsn_code: item.hsnCode,

        quantity: item.quantity,

        unit: item.unit,

        rate: item.rate,

        discount: item.discount,

        tax_percent: item.tax,

        amount: item.amount

    }));

    if (items.length === 0)
        return;

    const { error } = await supabase

        .from("invoice_items")

        .insert(items);

    if (error)
        throw error;

}

/* ==========================================================
   Save Complete
========================================================== */

async function finalizeSave() {

    state.editMode = false;

    state.selectedInvoice = null;

    console.log(
        "[Save Invoice] Completed"
    );

}

/* ==========================================================
   Post Save Operations
========================================================== */

async function afterSave() {

    finalizeSave();

    await refreshApplication();

    resetInvoiceForm();

}

/* ==========================================================
   Refresh Application
========================================================== */

async function refreshApplication() {

    try {

        const dashboardModule = await import("./dashboard.js");
        dashboardModule.refreshDashboard?.();

    } catch (error) {

        console.warn("[Save Invoice] Dashboard refresh skipped.", error);

    }

    try {

        const historyModule = await import("./history.js");
        historyModule.refreshHistory?.();

    } catch (error) {

        console.warn("[Save Invoice] History refresh skipped.", error);

    }

}

/* ==========================================================
   Reset Invoice
========================================================== */

function resetInvoiceForm() {

    state.currentInvoiceId = null;

    state.editMode = false;

    state.selectedInvoice = null;

    state.invoiceItems = [];

    state.customer = {};

    state.payment = {};

    state.totals = {};

}

/* ==========================================================
   Save And Reset
========================================================== */

export async function saveAndReset() {

    await saveInvoice();

    resetInvoiceForm();

}

/* ==========================================================
   Save And New Invoice
========================================================== */

export async function saveAndNew() {

    await saveInvoice();

    try {

        const invoiceModule = await import("./invoice.js");

        invoiceModule.createNewInvoice?.();

    } catch (error) {

        console.warn("[Save Invoice] Unable to create new invoice.", error);

    }

}

/* ==========================================================
   Public API
========================================================== */

export default {

    initializeSaveInvoice,

    saveInvoice,

    saveAndReset,

    saveAndNew

};
