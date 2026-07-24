/*
=========================================================
Genius Scientific ERP
invoice.js
=========================================================
Invoice Header Module
=========================================================
*/

import { supabase } from "../supabase.js";

import { state } from "./state.js";

import {
    qs,
    today,
    sanitizeString
} from "./utils.js";

import {
    showError
} from "./notifications.js";

/*=========================================================
DOM REFERENCES
=========================================================*/

const invoiceNumberInput = () => qs("#invoiceNumber");

const invoiceDateInput = () => qs("#invoiceDate");

/*=========================================================
INITIALIZE
=========================================================*/

export async function initializeInvoice() {

    try {

        setInvoiceDate();

        await loadLastInvoice();

        registerInvoiceEvents();

    }

    catch (error) {

        console.error(error);

        if (typeof showError === "function")
            showError(error.message);

    }

}

/*=========================================================
CURRENT INVOICE
=========================================================*/

export function getCurrentInvoice() {

    return state.currentInvoice;

}

export function setCurrentInvoice(invoice) {

    state.currentInvoice = invoice;

}

/*=========================================================
INVOICE DATE
=========================================================*/

export function setInvoiceDate(date = today()) {

    state.invoiceDate = date;

    const input = invoiceDateInput();

    if (input)
        input.value = date;

}

export function getInvoiceDate() {

    const input = invoiceDateInput();

    if (!input)
        return state.invoiceDate;

    return sanitizeString(input.value);

}

/*=========================================================
CLEAR HEADER
=========================================================*/

export function clearInvoiceHeader() {

    const number = invoiceNumberInput();

    const date = invoiceDateInput();

    if (number)
        number.value = "";

    if (date)
        date.value = today();

    state.currentInvoice = null;

    state.invoiceNumber = "";

    state.invoiceDate = today();

}

/*=========================================================
REGISTER EVENTS
=========================================================*/

function registerInvoiceEvents() {

    invoiceDateInput()?.addEventListener(

        "change",

        e => {

            state.invoiceDate = e.target.value;

        }

    );

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

        if (error) throw error;

        if (!data) {

            document.getElementById("invoiceNumber").value =
                generateInvoiceNumber();

            return;

        }

        state.lastInvoiceNumber = data.invoice_no;

        const invoiceInput =
            document.getElementById("invoiceNumber");

        if (!invoiceInput.value.trim()) {

            invoiceInput.value = getNextInvoiceNumber(
                data.invoice_no
            );

        }

    }

    catch (error) {

        console.error("Unable to load last invoice.", error);

        document.getElementById("invoiceNumber").value =
            generateInvoiceNumber();

    }

}

/* ============================================================
   Generate Invoice Number
============================================================ */

function generateInvoiceNumber() {

    return "GST/JK/000001";

}

/* ============================================================
   Get Next Invoice Number
============================================================ */

function getNextInvoiceNumber(lastInvoice) {

    if (!lastInvoice)
        return generateInvoiceNumber();

    const match = lastInvoice.match(/(\d+)$/);

    if (!match)
        return generateInvoiceNumber();

    const lastNumber =
        parseInt(match[1], 10);

    const nextNumber =
        String(lastNumber + 1)
            .padStart(match[1].length, "0");

    return lastInvoice.replace(/\d+$/, nextNumber);

}

/* ============================================================
   Validate Invoice Number
============================================================ */

export async function validateInvoiceNumber(invoiceNumber) {

    invoiceNumber = invoiceNumber.trim();

    if (!invoiceNumber.length) {

        showError("Invoice number cannot be empty.");

        return false;

    }

    const { data, error } = await supabase
        .from("invoices")
        .select("id")
        .eq("invoice_no", invoiceNumber)
        .limit(1);

    if (error) {

        console.error(error);

        showError("Unable to validate invoice number.");

        return false;

    }

    if (
        data &&
        data.length > 0 &&
        data[0].id !== state.currentInvoice?.id
    ) {

        showError("Invoice number already exists.");

        return false;

    }

    return true;

}

/* ============================================================
   Create New Invoice
============================================================ */

export function createNewInvoice() {

    state.currentInvoice = null;

    clearInvoiceHeader();

    document.getElementById("invoiceNumber").value =
        getNextInvoiceNumber(state.lastInvoiceNumber);

    setInvoiceDate();

}

/* ============================================================
   Reset Invoice Header
============================================================ */

export function resetInvoiceHeader() {

    clearInvoiceHeader();

    document.getElementById("invoiceNumber").value =
        getNextInvoiceNumber(state.lastInvoiceNumber);

    setInvoiceDate();

}

/* ============================================================
   Invoice Number Events
============================================================ */

function registerInvoiceEvents() {

    const invoiceInput =
        document.getElementById("invoiceNumber");

    invoiceInput.addEventListener("blur", async () => {

        const value =
            invoiceInput.value.trim();

        if (!value.length) {

            invoiceInput.value =
                getNextInvoiceNumber(state.lastInvoiceNumber);

            return;

        }

        await validateInvoiceNumber(value);

    });

    document
        .getElementById("btnNewInvoice")
        .addEventListener(
            "click",
            createNewInvoice
        );

}

/* ============================================================
   Current Invoice Helpers
============================================================ */

export function getInvoiceNumber() {

    return document
        .getElementById("invoiceNumber")
        .value
        .trim();

}

export function setInvoiceNumber(number) {

    document
        .getElementById("invoiceNumber")
        .value = number ?? "";

}

/* ============================================================
   Load Invoice Header
============================================================ */

export function loadInvoiceHeader(invoice) {

    if (!invoice) return;

    state.currentInvoice = invoice;

    setInvoiceNumber(invoice.invoice_no);

    if (invoice.invoice_date)
        setInvoiceDate(invoice.invoice_date);

}

/* ============================================================
   Save Header To State
============================================================ */

export function syncInvoiceHeader() {

    if (!state.currentInvoice)
        state.currentInvoice = {};

    state.currentInvoice.invoice_no =
        getInvoiceNumber();

    state.currentInvoice.invoice_date =
        getInvoiceDate();

}
