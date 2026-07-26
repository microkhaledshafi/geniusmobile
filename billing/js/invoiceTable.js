/* ==========================================================
   Genius Scientific ERP
   invoiceTable.js
   Part 1
   Invoice Table Foundation
========================================================== */

import { state } from "./state.js";
import { qs } from "./utils.js";
import { recalculateRow } from "./calculations.js";

let initialized = false;

let tableBody = null;
let rowTemplate = null;

/* ==========================================================
   Initialize
========================================================== */

export function initializeInvoiceTable() {

    if (initialized) return;

    initialized = true;

    tableBody = qs("#invoiceItemsBody");

    rowTemplate = qs("#invoiceRowTemplate");

    if (!tableBody)
        throw new Error("Invoice table body not found.");

    if (!rowTemplate)
        throw new Error("Invoice row template not found.");

    registerTableEvents();

    if (state.invoiceItems.length === 0) {

        addInvoiceRow();

    }

    console.log("[Invoice Table] Initialized");

}

/* ==========================================================
   Event Registration
========================================================== */

function registerTableEvents() {

    tableBody.addEventListener("click", onTableClick);

}

/* ==========================================================
   Table Click Handler
========================================================== */

function onTableClick(event) {

    const button = event.target.closest("button");

    if (!button) return;

    if (button.classList.contains("btn-add-row")) {

        addInvoiceRow();

        return;

    }

    if (button.classList.contains("btn-delete-row")) {

        const row = button.closest("tr");

        removeInvoiceRow(row);

    }

}

/* ==========================================================
   Create Row
========================================================== */

function createInvoiceRow() {

    const fragment =
        rowTemplate.content.cloneNode(true);

    return fragment;

}

/* ==========================================================
   Add Row
========================================================== */

export function addInvoiceRow(product = null) {

    const fragment = createInvoiceRow();

    tableBody.appendChild(fragment);

    const row =
        tableBody.lastElementChild;

   registerRowEvents(row);

    renumberRows();

    if (product) {

        fillRow(row, product);

    }

    state.invoiceItems.push({});

    return row;

}

/* ==========================================================
   Remove Row
========================================================== */

export function removeInvoiceRow(row) {

    if (!row) return;

    if (tableBody.rows.length === 1)
        return;

    const index =
        [...tableBody.rows].indexOf(row);

    row.remove();

    if (index >= 0) {

        state.invoiceItems.splice(index, 1);

    }

    renumberRows();

}

/* ==========================================================
   Row Numbers
========================================================== */

function renumberRows() {

    [...tableBody.rows].forEach((row, index) => {

        const serial =
            row.querySelector(".serial");

        if (serial) {

            serial.textContent = index + 1;

        }

    });

}

/* ==========================================================
   Fill Row From Product
========================================================== */

function fillRow(row, product) {

    if (!row || !product) return;

    row.querySelector(".productCode").value =
        product.product_code || "";

    row.querySelector(".productName").value =
        product.name || "";

    row.querySelector(".hsn").value =
        product.hsn_code || "";

    row.querySelector(".qty").value = 1;

    row.querySelector(".rate").value =
        product.rate || 0;

    row.querySelector(".discount").value =
        product.discount || 0;

    row.querySelector(".gst").value =
        product.tax || product.gst || 0;

    updateInvoiceItem(row);

    recalculateRow(row);

}

/* ==========================================================
   Update State From Row
========================================================== */

export function updateInvoiceItem(row) {

    if (!row) return;

    const index =
        [...tableBody.rows].indexOf(row);

    if (index < 0) return;

    state.invoiceItems[index] = {

        product_code:
            row.querySelector(".productCode")?.value || "",

        product_name:
            row.querySelector(".productName")?.value || "",

        hsn_code:
            row.querySelector(".hsn")?.value || "",

        quantity:
            Number(
                row.querySelector(".qty")?.value || 0
            ),

        rate:
            Number(
                row.querySelector(".rate")?.value || 0
            ),

        discount:
            Number(
                row.querySelector(".discount")?.value || 0
            ),

        gst:
            Number(
                row.querySelector(".gst")?.value || 0
            )

    };

}

/* ==========================================================
   Read All Rows
========================================================== */

export function getInvoiceItems() {

    syncInvoiceItems();

    return [...state.invoiceItems];

}

/* ==========================================================
   Sync Complete Table
========================================================== */

export function syncInvoiceItems() {

    state.invoiceItems = [];

    [...tableBody.rows].forEach(row => {

        state.invoiceItems.push({

            product_code:
                row.querySelector(".productCode")?.value || "",

            product_name:
                row.querySelector(".productName")?.value || "",

            hsn_code:
                row.querySelector(".hsn")?.value || "",

            quantity:
                Number(
                    row.querySelector(".qty")?.value || 0
                ),

            rate:
                Number(
                    row.querySelector(".rate")?.value || 0
                ),

            discount:
                Number(
                    row.querySelector(".discount")?.value || 0
                ),

            gst:
                Number(
                    row.querySelector(".gst")?.value || 0
                )

        });

    });

}

/* ==========================================================
   Clear Invoice Table
========================================================== */

export function clearInvoiceItems() {

    tableBody.innerHTML = "";

    state.invoiceItems = [];

    addInvoiceRow();

}

/* ==========================================================
   Find Row Index
========================================================== */

export function getRowIndex(row) {

    return [...tableBody.rows].indexOf(row);

}

/* ==========================================================
   Get Row
========================================================== */

export function getRow(index) {

    return tableBody.rows[index] || null;

}

/* ==========================================================
   Register Row Events
========================================================== */

function registerRowEvents(row) {

    if (!row) return;

    row.addEventListener("input", onRowInput);

    row.addEventListener("keydown", onRowKeyDown);

    row.addEventListener("change", onRowChange);

}

/* ==========================================================
   Input Events
========================================================== */

function onRowInput(event) {

    const row = event.target.closest("tr");

    if (!row) return;

    updateInvoiceItem(row);

    recalculateRow(row);

}

/* ==========================================================
   Change Events
========================================================== */

function onRowChange(event) {

    const row = event.target.closest("tr");

    if (!row) return;

    updateInvoiceItem(row);

    recalculateRow(row);

}

/* ==========================================================
   Keyboard Navigation
========================================================== */

function onRowKeyDown(event) {

    const row = event.target.closest("tr");

    if (!row) return;

    switch (event.key) {

        case "Enter":

            event.preventDefault();

            focusNextField(event.target);

            break;

        case "Delete":

            if (event.ctrlKey) {

                event.preventDefault();

                removeInvoiceRow(row);

            }

            break;

    }

}

/* ==========================================================
   Focus Next Field
========================================================== */

function focusNextField(current) {

    const fields = [

        ".productCode",
        ".productName",
        ".qty",
        ".rate",
        ".discount",
        ".gst"

    ];

    const row = current.closest("tr");

    if (!row) return;

    let index = -1;

    fields.forEach((selector, i) => {

        if (current.matches(selector))
            index = i;

    });

    if (index === -1) return;

    if (index === fields.length - 1) {

        const nextRow = row.nextElementSibling;

        if (nextRow) {

            nextRow.querySelector(fields[0])?.focus();

        } else {

            const newRow = addInvoiceRow();

            registerRowEvents(newRow);

            newRow.querySelector(fields[0])?.focus();

        }

        return;

    }

    row.querySelector(fields[index + 1])?.focus();

}

/* ==========================================================
   Load Existing Invoice
========================================================== */

export function loadInvoiceItems(items = []) {

    clearInvoiceItems();

    items.forEach(item => {

        const row = addInvoiceRow(item);

        registerRowEvents(row);

        updateInvoiceItem(row);

        recalculateRow(row);

    });

    if (items.length === 0) {

        const row = addInvoiceRow();

        registerRowEvents(row);

    }

}

/* ==========================================================
   Refresh Table
========================================================== */

export function refreshInvoiceTable() {

    syncInvoiceItems();

    [...tableBody.rows].forEach(row => {

        recalculateRow(row);

    });

}

/* ==========================================================
   Public API
========================================================== */

export default {

    initializeInvoiceTable,

    addInvoiceRow,

    removeInvoiceRow,

    clearInvoiceItems,

    getInvoiceItems,

    updateInvoiceItem,

    syncInvoiceItems,

    loadInvoiceItems,

    refreshInvoiceTable,

    getRow,

    getRowIndex

};
