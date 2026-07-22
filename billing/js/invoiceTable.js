/*
==========================================================
Genius Scientific ERP
Billing Module

File:
invoiceTable.js

Purpose:
Manage invoice item rows.

Responsibilities

• Add Item
• Remove Item
• Edit Quantity
• Edit Rate
• Edit Discount
• Edit GST
• Calculate Line Amount
• Calculate Line Tax
• Calculate Line Total
• Row Validation
• Read Items
• Write Items
• Clear Items

==========================================================
*/

/*==========================================================
API
==========================================================*/


/*==========================================================
State
==========================================================*/

import {

    state

} from "./state.js";

/*==========================================================
Product Search
==========================================================*/

import {

    openProductSearch

} from "./productSearch.js";

/*==========================================================
Notifications
==========================================================*/

import {

    showError,
    showWarning

} from "./notifications.js";

/*==========================================================
Utilities
==========================================================*/

import {

    isEmpty,
    sanitizeString,
    formatNumber,
    parseNumber

} from "./utils.js";
/*==========================================================
Private Variables
==========================================================*/

let elements = {

    table: null,

    tbody: null,

    addButton: null,

    rowTemplate: null

};

let invoiceItems = [];

/*==========================================================
Cache DOM
==========================================================*/

function cacheDom() {

    elements.table =
        document.getElementById("invoiceItemsTable");

    elements.tbody =
        document.getElementById("invoiceItemsBody");

    elements.addButton =
        document.getElementById("btnAddItem");

    elements.rowTemplate =
        document.getElementById("invoiceRowTemplate");

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

function getInvoiceItemsState() {

    return invoiceItems;

}

function setInvoiceItemsState(items = []) {

    invoiceItems = Array.isArray(items)
        ? items
        : [];

}

function getRowCount() {

    return invoiceItems.length;

}

function getTableBody() {

    return elements.tbody;

}

function getRowTemplate() {

    return elements.rowTemplate;

}
/*==========================================================
Row Helpers
==========================================================*/

/**
 * Create invoice row
 */
function createRow(item = {}) {

    const template = getRowTemplate();

    if (!template) {

        return null;

    }

    const fragment =
        template.content.cloneNode(true);

    const row =
        fragment.querySelector("tr");

   row.dataset.productId =
    item.productId ?? "";

row.querySelector(".product-name").value =
    sanitizeString(item.productName ?? "");

row.querySelector(".quantity").value =
    item.quantity ?? 1;

row.querySelector(".rate").value =
    formatNumber(item.rate ?? 0);

row.querySelector(".discount").value =
    formatNumber(item.discount ?? 0);

row.querySelector(".gst").value =
    formatNumber(item.gst ?? 0);

    calculateRow(row);

    return row;

}

/**
 * Append row
 */
function appendRow(item = {}) {

    const row = createRow(item);

    if (!row) {

        return null;

    }

    getTableBody().appendChild(row);

refreshRowNumbers();

setInvoiceItemsState(readRows());

return row;

}

/**
 * Delete row
 */
function deleteRow(row) {

    if (!row) {

        return;

    }

    row.remove();

refreshRowNumbers();

setInvoiceItemsState(readRows());

}

/**
 * Calculate row values
 */
function calculateRow(row) {

    if (!row) {

        return;

    }

    const quantity = parseNumber(

        row.querySelector(".quantity").value

    );

    const rate = parseNumber(

        row.querySelector(".rate").value

    );

    const discount = parseNumber(

        row.querySelector(".discount").value

    );

    const gst = parseNumber(

        row.querySelector(".gst").value

    );

    const gross = quantity * rate;

    const discountAmount =
        gross * discount / 100;

    const amount =
        gross - discountAmount;

    const tax =
        amount * gst / 100;

    const total =
        amount + tax;

    row.querySelector(".amount").textContent =
        formatNumber(amount);

    row.querySelector(".tax").textContent =
        formatNumber(tax);

    row.querySelector(".total").textContent =
        formatNumber(total);

}

/**
 * Refresh row numbers
 */
function refreshRowNumbers() {

    const rows =
        getTableBody().querySelectorAll("tr");

    rows.forEach((row, index) => {

        row.querySelector(".row-number")
            .textContent = index + 1;

    });

}

/**
 * Read invoice rows
 */
function readRows() {

    const rows =
        getTableBody().querySelectorAll("tr");

    return Array.from(rows).map(row => ({

    productId:
        row.dataset.productId ?? "",

    productName:
        row.querySelector(".product-name").value,

    quantity:
        parseNumber(
            row.querySelector(".quantity").value
        ),

    rate:
        parseNumber(
            row.querySelector(".rate").value
        ),

    discount:
        parseNumber(
            row.querySelector(".discount").value
        ),

    gst:
        parseNumber(
            row.querySelector(".gst").value
        )

}));

}

/**
 * Write invoice rows
 */
function writeRows(items = []) {

    resetTable();

    items.forEach(item => {

        appendRow(item);

    });

}

/**
 * Reset table
 */
function resetTable() {

    getTableBody().innerHTML = "";

    refreshRowNumbers();

}

/**
 * Validate rows
 */
function validateRows() {

    const rows = readRows();

    if (!rows.length) {

        showWarning(

            "Please add at least one item."

        );

        return false;

    }

    for (const row of rows) {

        if (isEmpty(row.productName)) {

            showError(

                "Product is required."

            );

            return false;

        }

        if (row.quantity <= 0) {

            showError(

                "Quantity must be greater than zero."

            );

            return false;

        }

    }

    return true;

}
/*==========================================================
Event Handlers
==========================================================*/

/**
 * Handle Add Item
 */
function handleAddItem() {

    appendRow();

}

/**
 * Handle Product Click
 */
function handleProductClick(target) {

    if (!target.classList.contains("product-name")) {

        return;

    }

    state.activeInvoiceRow =
        target.closest("tr");

    openProductSearch();

}

/**
 * Handle Row Input
 */
function handleRowInput(target) {

    const row = target.closest("tr");

    if (!row) {

        return;

    }

    if (

        target.classList.contains("quantity") ||

        target.classList.contains("rate") ||

        target.classList.contains("discount") ||

        target.classList.contains("gst")

    ) {

        calculateRow(row);

    }

}

/**
 * Handle Remove Row
 */
function handleRemoveRow(target) {

    if (

        !target.classList.contains("remove-row") &&

        !target.closest(".remove-row")

    ) {

        return;

    }

    const button = target.closest(".remove-row");

    const row = button.closest("tr");

    deleteRow(row);

}

/**
 * Table Click Handler
 */
function handleTableClick(event) {

    const target = event.target;

    handleProductClick(target);

    handleRemoveRow(target);

}

/**
 * Table Input Handler
 */
function handleTableInput(event) {

    handleRowInput(event.target);

}

/**
 * Register Events
 */
function registerEvents() {

    if (elements.addButton) {

        elements.addButton.addEventListener(

            "click",

            handleAddItem

        );

    }

    if (elements.tbody) {

        elements.tbody.addEventListener(

            "click",

            handleTableClick

        );

        elements.tbody.addEventListener(

            "input",

            handleTableInput

        );

    }

}
/*==========================================================
Public API
==========================================================*/

/**
 * Initialize Invoice Table Module
 */
export function initInvoiceTable() {

    cacheDom();

    if (!hasCachedDom()) {

        console.warn(

            "[Invoice Table] Required elements not found."

        );

        return false;

    }

    registerEvents();

    resetTable();

    console.log(

        "[Invoice Table] Module initialized."

    );

    return true;

}

/**
 * Add Invoice Row
 */
export function addInvoiceRow(item = {}) {

    return appendRow(item);

}

/**
 * Remove Invoice Row
 */
export function removeInvoiceRow(rowIndex) {

    const rows = getTableBody().querySelectorAll("tr");

    if (!rows[rowIndex]) {

        return false;

    }

    deleteRow(rows[rowIndex]);

    return true;

}

/**
 * Get Invoice Items
 */
export function getInvoiceItems() {

    const items = readRows();

    setInvoiceItemsState(items);

    return items;

}

/**
 * Set Invoice Items
 */
export function setInvoiceItems(items = []) {

    setInvoiceItemsState(items);

    writeRows(items);

}

/**
 * Clear Invoice Items
 */
export function clearInvoiceItems() {

    setInvoiceItemsState([]);

    resetTable();

}

/**
 * Validate Invoice Items
 */
export function validateInvoiceItems() {

    return validateRows();

}
