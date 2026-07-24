/* ============================================================
   invoice.js
   Handles invoice header only
============================================================ */

import { supabase } from "../supabase.js";

import {
    state,
    markInvoiceChanged,
    clearInvoiceChanged
} from "./state.js";

import {
    qs,
    today
} from "./utils.js";

import {
    showError
} from "./notifications.js";

/* ============================================================
   Private Variables
============================================================ */

let initialized = false;

/* ============================================================
   Initialize
============================================================ */

export async function initializeInvoice() {

    if (initialized)
        return;

    initialized = true;

    setInvoiceDate();

    registerInvoiceEvents();

    await loadLastInvoice();

}

/* ============================================================
   Event Registration
============================================================ */

function registerInvoiceEvents() {

    const invoiceNumber = qs("#invoiceNumber");
    const invoiceDate = qs("#invoiceDate");
    const btnNewInvoice = qs("#btnNewInvoice");

    invoiceNumber?.addEventListener("blur", onInvoiceNumberBlur);

    invoiceNumber?.addEventListener("input", () => {

        markInvoiceChanged();

    });

    invoiceDate?.addEventListener("change", () => {

        markInvoiceChanged();

    });

    btnNewInvoice?.addEventListener(
        "click",
        createNewInvoice
    );

}

/* ============================================================
   Invoice Date
============================================================ */

export function setInvoiceDate(date = today()) {

    const input = qs("#invoiceDate");

    if (input)
        input.value = date;

}

export function getInvoiceDate() {

    return qs("#invoiceDate")?.value || "";

}

/* ============================================================
   Invoice Number
============================================================ */

export function setInvoiceNumber(number) {

    const input = qs("#invoiceNumber");

    if (input)
        input.value = number || "";

}

export function getInvoiceNumber() {

    return qs("#invoiceNumber")?.value.trim() || "";

}

/* ============================================================
   Current Invoice
============================================================ */

export function getCurrentInvoice() {

    return state.currentInvoice;

}

export function setCurrentInvoice(invoice) {

    state.currentInvoice = invoice;

}

/* ============================================================
   Header Helpers
============================================================ */

export function clearInvoiceHeader() {

    setInvoiceNumber("");

    setInvoiceDate();

}

/* ============================================================
   Invoice Blur Validation
============================================================ */

async function onInvoiceNumberBlur() {

    const value = getInvoiceNumber();

    if (!value.length) {

        setInvoiceNumber(
            getNextInvoiceNumber(state.lastInvoiceNumber)
        );

        return;

    }

    await validateInvoiceNumber(value);

}

/* ============================================================
   Load Last Invoice
============================================================ */

async function loadLastInvoice() {

    try {

        const { data, error } = await supabase
            .from("invoices")
            .select("invoice_no")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error)
            throw error;

      if (!data) {

    state.lastInvoiceNumber = "";

    state.invoiceNumber = generateInvoiceNumber();

    setInvoiceNumber(state.invoiceNumber);

    return;

}

        }

        state.lastInvoiceNumber =
            data.invoice_no;
   state.invoiceNumber =
    data.invoice_no;

        if (!getInvoiceNumber()) {

            setInvoiceNumber(
                getNextInvoiceNumber(
                    state.lastInvoiceNumber
                )
            );

        }

    }

    catch (error) {

        console.error(error);

        showError(
            "Unable to load last invoice."
        );

        setInvoiceNumber(
            generateInvoiceNumber()
        );

    }

}

/* ============================================================
   Default Invoice Number
============================================================ */

function generateInvoiceNumber() {

    return "GST/JK/000001";

}

/* ============================================================
   Next Invoice Number
============================================================ */

function getNextInvoiceNumber(lastInvoice) {

    if (!lastInvoice)
        return generateInvoiceNumber();

    const match =
        lastInvoice.match(/(\d+)$/);

    if (!match)
        return generateInvoiceNumber();

    const last =
        parseInt(match[1], 10);

    const next =
        String(last + 1)
            .padStart(
                match[1].length,
                "0"
            );

    return lastInvoice.replace(
        /\d+$/,
        next
    );

}

/* ============================================================
   Validate Invoice Number
============================================================ */

export async function validateInvoiceNumber(invoiceNumber) {

    invoiceNumber =
        invoiceNumber.trim();

    if (!invoiceNumber.length) {

        showError(
            "Invoice number is required."
        );

        return false;

    }

    try {

        const { data, error } = await supabase
            .from("invoices")
            .select("id")
            .eq(
                "invoice_no",
                invoiceNumber
            )
            .maybeSingle();

        if (error)
            throw error;

        if (
            data &&
            data.id !== state.currentInvoice?.id
        ) {

            showError(
                "Invoice number already exists."
            );

            return false;

        }

        return true;

    }

    catch (error) {

        console.error(error);

        showError(
            "Unable to validate invoice number."
        );

        return false;

    }

}

/* ============================================================
   New Invoice
============================================================ */

export function createNewInvoice() {

    state.currentInvoice = null;

    clearInvoiceChanged();

    clearInvoiceHeader();

    const nextNumber =
        getNextInvoiceNumber(
            state.lastInvoiceNumber
        );

    state.lastInvoiceNumber = nextNumber;

    state.invoiceNumber = nextNumber;

    setInvoiceNumber(nextNumber);

    setInvoiceDate();

}
/* ============================================================
   Header → State
============================================================ */

export function syncInvoiceHeader() {

    if (!state.currentInvoice)
        state.currentInvoice = {};

    state.currentInvoice.invoice_no =
        getInvoiceNumber();

    state.currentInvoice.invoice_date =
        getInvoiceDate();

}

/* ============================================================
   State → Header
============================================================ */

export function loadInvoiceHeader(invoice) {

    if (!invoice)
        return;

    state.currentInvoice = invoice;

    setInvoiceNumber(
        invoice.invoice_no
    );

    setInvoiceDate(
        invoice.invoice_date
    );

}

/* ============================================================
   Validate Invoice Header
============================================================ */

export function validateInvoiceHeader() {

    const invoiceNumber = getInvoiceNumber();

    if (!invoiceNumber) {

        showError("Invoice number is required.");

        return false;

    }

    const invoiceDate = getInvoiceDate();

    if (!invoiceDate) {

        showError("Invoice date is required.");

        return false;

    }

    return true;

}

/* ============================================================
   Invoice Changed Helpers
============================================================ */

export function isInvoiceModified() {

    return state.flags.invoiceChanged;

}

export function markInvoiceModified() {

    markInvoiceChanged();

}

export function clearInvoiceModified() {

    clearInvoiceChanged();

}

/* ============================================================
   Refresh Invoice Number
============================================================ */

export function refreshInvoiceNumber() {

    setInvoiceNumber(
        getNextInvoiceNumber(
            state.lastInvoiceNumber
        )
    );

}

/* ============================================================
   Before Unload Protection
============================================================ */

window.addEventListener("beforeunload", event => {

    if (!isInvoiceModified())
        return;

    event.preventDefault();

    event.returnValue = "";

});

/* ============================================================
   Destroy Invoice
============================================================ */

export function destroyInvoice() {

    clearInvoiceHeader();

    state.currentInvoice = null;

    clearInvoiceChanged();

}

/* ============================================================
   Public API
============================================================ */

export default {

    initializeInvoice,

    createNewInvoice,

    destroyInvoice,

    validateInvoiceHeader,

    validateInvoiceNumber,

    getCurrentInvoice,

    setCurrentInvoice,

    getInvoiceNumber,

    setInvoiceNumber,

    getInvoiceDate,

    setInvoiceDate,

    syncInvoiceHeader,

    loadInvoiceHeader,

    refreshInvoiceNumber,

    isInvoiceModified,

    markInvoiceModified,

    clearInvoiceModified

};
