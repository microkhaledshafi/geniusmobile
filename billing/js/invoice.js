/*
==========================================================
Genius Scientific ERP
Billing Module

File:
invoice.js

Purpose:
Manage invoice header.

Responsibilities

• Invoice Number
• Invoice Date
• Invoice Type
• GST Type
• Salesman
• Doctor Reference
• Due Date
• Remarks
• Header Validation
• Header Reset

==========================================================
*/

/*==========================================================
API
==========================================================*/

import {

    getNextInvoiceNumber

} from "./api.js";

/*==========================================================
State
==========================================================*/

import {

    state

} from "./state.js";

/*==========================================================
Notifications
==========================================================*/

import {

    showError,
    showSuccess,
    showWarning

} from "./notifications.js";

/*==========================================================
Utilities
==========================================================*/

import {

    formatDate,
    today,
    isEmpty,
    sanitizeString

} from "./utils.js";
/*==========================================================
Private Variables
==========================================================*/

let elements = {

    invoiceNumber: null,

    invoiceDate: null,

    invoiceType: null,

    gstType: null,

    salesman: null,

    doctor: null,

    dueDate: null,

    remarks: null

};

/*==========================================================
Cache DOM
==========================================================*/

function cacheDom() {

    elements.invoiceNumber =
        document.getElementById("invoiceNumber");

    elements.invoiceDate =
        document.getElementById("invoiceDate");

    elements.invoiceType =
        document.getElementById("invoiceType");

    elements.gstType =
        document.getElementById("gstType");

    elements.salesman =
        document.getElementById("salesman");

    elements.doctor =
        document.getElementById("doctor");

    elements.dueDate =
        document.getElementById("dueDate");

    elements.remarks =
        document.getElementById("remarks");

}

/*==========================================================
Private Getters
==========================================================*/

function getElements() {

    return elements;

}

function hasCachedDom() {

    return Object
        .values(elements)
        .every(element => element !== null);

}
/*==========================================================
Header Helpers
==========================================================*/

/**
 * Load next invoice number
 */
async function loadInvoiceNumber() {

    const invoiceNumber = await getNextInvoiceNumber();

    if (elements.invoiceNumber) {

        elements.invoiceNumber.value = invoiceNumber;

    }

    state.invoiceNumber = invoiceNumber;

}

/**
 * Load today's date
 */
function loadInvoiceDate() {

    const currentDate = today();

    if (elements.invoiceDate) {

        elements.invoiceDate.value = currentDate;

    }

    state.invoiceDate = currentDate;

}

/**
 * Calculate due date
 */
function calculateDueDate(days = 0) {

    const date = new Date();

    date.setDate(

        date.getDate() + Number(days)

    );

    const dueDate = formatDate(date);

    if (elements.dueDate) {

        elements.dueDate.value = dueDate;

    }

    state.dueDate = dueDate;

}

/**
 * Load default values
 */
function loadDefaultValues() {

    if (elements.invoiceType) {

        state.invoiceType = elements.invoiceType.value;

    }

    if (elements.gstType) {

        state.gstType = elements.gstType.value;

    }

    if (elements.salesman) {

        state.salesman = sanitizeString(

            elements.salesman.value

        );

    }

    if (elements.doctor) {

        state.doctor = sanitizeString(

            elements.doctor.value

        );

    }

    if (elements.remarks) {

        state.remarks = sanitizeString(

            elements.remarks.value

        );

    }

}

/**
 * Read invoice header
 */
function readHeader() {

    return {

        invoiceNumber: elements.invoiceNumber
            ? elements.invoiceNumber.value
            : "",

        invoiceDate: elements.invoiceDate
            ? elements.invoiceDate.value
            : "",

        invoiceType: elements.invoiceType
            ? elements.invoiceType.value
            : "",

        gstType: elements.gstType
            ? elements.gstType.value
            : "",

        salesman: elements.salesman
            ? sanitizeString(elements.salesman.value)
            : "",

        doctor: elements.doctor
            ? sanitizeString(elements.doctor.value)
            : "",

        dueDate: elements.dueDate
            ? elements.dueDate.value
            : "",

        remarks: elements.remarks
            ? sanitizeString(elements.remarks.value)
            : ""

    };

}

/**
 * Write invoice header
 */
function writeHeader(header) {

    if (!header) {

        return;

    }

    if (elements.invoiceNumber) {

        elements.invoiceNumber.value =
            header.invoiceNumber ?? "";

    }

    if (elements.invoiceDate) {

        elements.invoiceDate.value =
            header.invoiceDate ?? "";

    }

    if (elements.invoiceType) {

        elements.invoiceType.value =
            header.invoiceType ?? "";

    }

    if (elements.gstType) {

        elements.gstType.value =
            header.gstType ?? "";

    }

    if (elements.salesman) {

        elements.salesman.value =
            header.salesman ?? "";

    }

    if (elements.doctor) {

        elements.doctor.value =
            header.doctor ?? "";

    }

    if (elements.dueDate) {

        elements.dueDate.value =
            header.dueDate ?? "";

    }

    if (elements.remarks) {

        elements.remarks.value =
            header.remarks ?? "";

    }

}

/**
 * Reset invoice header
 */
function resetHeader() {

    writeHeader({

        invoiceNumber: "",
        invoiceDate: "",
        invoiceType: "",
        gstType: "",
        salesman: "",
        doctor: "",
        dueDate: "",
        remarks: ""

    });

}
/*==========================================================
Event Handlers
==========================================================*/

/**
 * Handle invoice date change
 */
function handleInvoiceDateChange() {

    if (!elements.invoiceDate) {

        return;

    }

    state.invoiceDate = elements.invoiceDate.value;

}

/**
 * Handle invoice type change
 */
function handleInvoiceTypeChange() {

    if (!elements.invoiceType) {

        return;

    }

    state.invoiceType = elements.invoiceType.value;

}

/**
 * Handle GST type change
 */
function handleGstTypeChange() {

    if (!elements.gstType) {

        return;

    }

    state.gstType = elements.gstType.value;

}

/**
 * Handle salesman change
 */
function handleSalesmanChange() {

    if (!elements.salesman) {

        return;

    }

    state.salesman = sanitizeString(

        elements.salesman.value

    );

}

/**
 * Handle doctor change
 */
function handleDoctorChange() {

    if (!elements.doctor) {

        return;

    }

    state.doctor = sanitizeString(

        elements.doctor.value

    );

}

/**
 * Handle due date change
 */
function handleDueDateChange() {

    if (!elements.dueDate) {

        return;

    }

    state.dueDate = elements.dueDate.value;

}

/**
 * Handle remarks change
 */
function handleRemarksChange() {

    if (!elements.remarks) {

        return;

    }

    state.remarks = sanitizeString(

        elements.remarks.value

    );

}

/**
 * Register all events
 */
function registerEvents() {

    if (elements.invoiceDate) {

        elements.invoiceDate.addEventListener(

            "change",

            handleInvoiceDateChange

        );

    }

    if (elements.invoiceType) {

        elements.invoiceType.addEventListener(

            "change",

            handleInvoiceTypeChange

        );

    }

    if (elements.gstType) {

        elements.gstType.addEventListener(

            "change",

            handleGstTypeChange

        );

    }

    if (elements.salesman) {

        elements.salesman.addEventListener(

            "input",

            handleSalesmanChange

        );

    }

    if (elements.doctor) {

        elements.doctor.addEventListener(

            "input",

            handleDoctorChange

        );

    }

    if (elements.dueDate) {

        elements.dueDate.addEventListener(

            "change",

            handleDueDateChange

        );

    }

    if (elements.remarks) {

        elements.remarks.addEventListener(

            "input",

            handleRemarksChange

        );

    }

}

/**
 * Validate invoice header
 */
function validateHeader() {

    const header = readHeader();

    if (isEmpty(header.invoiceDate)) {

        showError(

            "Invoice date is required."

        );

        return false;

    }

    if (isEmpty(header.invoiceType)) {

        showError(

            "Invoice type is required."

        );

        return false;

    }

    return true;

}
/*==========================================================
Public API
==========================================================*/

/**
 * Initialize Invoice Module
 */
export async function initInvoice() {

    cacheDom();

    if (!hasCachedDom()) {

        console.warn(

            "[Invoice] Invoice header elements not found."

        );

        return false;

    }

    registerEvents();

    await loadInvoiceNumber();

    loadInvoiceDate();

    calculateDueDate();

    loadDefaultValues();

    console.log(

        "[Invoice] Module initialized."

    );

    return true;

}

/**
 * Get Invoice Header
 */
export function getInvoiceHeader() {

    return readHeader();

}

/**
 * Set Invoice Header
 */
export function setInvoiceHeader(header) {

    writeHeader(header);

}

/**
 * Clear Invoice Header
 */
export async function clearInvoiceHeader() {

    resetHeader();

    await loadInvoiceNumber();

    loadInvoiceDate();

    calculateDueDate();

}

/**
 * Validate Invoice Header
 */
export function validateInvoiceHeader() {

    return validateHeader();

}
