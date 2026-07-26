/* ==========================================================
   Genius Scientific ERP
   invoiceTable.js
   Part 1
   Invoice Table Engine
========================================================== */

import { state } from "./state.js";
import { qs } from "./utils.js";
import { recalculateRow } from "./calculations.js";
import { openProductSearch } from "./productSearch.js";
import { getProductByBarcode } from "./api.js";

let initialized = false;

let tableBody = null;

/* ==========================================================
   Initialize
========================================================== */

export function initializeInvoiceTable() {

    if (initialized)
        return;

    tableBody = qs("#invoiceTableBody");

    if (!tableBody)
        throw new Error("invoiceTableBody not found.");

    registerTableEvents();

    addInvoiceRow();

    initialized = true;

    console.log("[InvoiceTable] Initialized");

}

/* ==========================================================
   Register Events
========================================================== */

function registerTableEvents() {

    tableBody.addEventListener("click", handleTableClick);

    tableBody.addEventListener("input", handleInput);

    tableBody.addEventListener("change", handleChange);

    tableBody.addEventListener("keydown", handleKeyDown);

}

/* ==========================================================
   Add Row
========================================================== */

export function addInvoiceRow(product = null) {

    const row = document.createElement("tr");

    row.innerHTML = createRowHTML();

    tableBody.appendChild(row);

    renumberRows();

    state.invoiceItems.push({});

    if (product) {

        fillRow(row, product);

    }

    return row;

}

/* ==========================================================
   Remove Row
========================================================== */

export function removeInvoiceRow(row) {

    if (!row)
        return;

    if (tableBody.rows.length === 1)
        return;

    const index = getRowIndex(row);

    row.remove();

    if (index >= 0)
        state.invoiceItems.splice(index, 1);

    renumberRows();

}

/* ==========================================================
   Row HTML
========================================================== */

function createRowHTML() {

    return `

<tr>

<td class="serial text-center">1</td>

<td>

<input
type="hidden"
class="form-control productId">

<input
type="text"
class="form-control productBarcode"
placeholder="Barcode">

</td>

<td>

<div class="input-group">

<input
type="text"
class="form-control productName"
readonly>

<button
type="button"
class="btn btn-outline-primary btnProductSearch">

<i class="bi bi-search"></i>

</button>

</div>

</td>

<td>

<input
type="text"
class="form-control batch">

</td>

<td>

<input
type="month"
class="form-control expiry">

</td>

<td>

<input
type="text"
class="form-control hsn">

</td>

<td>

<input
type="number"
class="form-control qty"
value="1"
min="1">

</td>

<td>

<input
type="number"
class="form-control mrp"
value="0">

</td>

<td>

<input
type="number"
class="form-control rate"
value="0">

</td>

<td>

<input
type="number"
class="form-control discount"
value="0">

</td>

<td>

<input
type="number"
class="form-control gst"
value="0">

</td>

<td>

<input
type="number"
class="form-control amount"
readonly>

</td>

<td class="text-center">

<button
type="button"
class="btn btn-danger btnDeleteRow">

×

</button>

</td>

</tr>

`;

}

/* ==========================================================
   Fill Row From Product
========================================================== */

export function fillRow(row, product) {

    if (!row || !product)
        return;

    row.querySelector(".productId").value =
        product.id ?? "";

    row.querySelector(".productBarcode").value =
        product.barcode ?? "";

    row.querySelector(".productName").value =
        product.product_name ??
        product.name ??
        "";

    row.querySelector(".batch").value =
        product.batch ?? "";

    row.querySelector(".expiry").value =
        product.expiry ?? "";

    row.querySelector(".hsn").value =
        product.hsn_code ?? "";

    row.querySelector(".qty").value = 1;

    row.querySelector(".mrp").value =
        Number(product.mrp ?? 0);

    row.querySelector(".rate").value =
        Number(product.rate ?? 0);

    row.querySelector(".discount").value =
        Number(product.discount ?? 0);

    row.querySelector(".gst").value =
        Number(product.gst ?? product.tax ?? 0);

    updateInvoiceItem(row);

    recalculateRow(row);

}

/* ==========================================================
   Row Numbers
========================================================== */

function renumberRows() {

    [...tableBody.rows].forEach((row, index) => {

        const serial =
            row.querySelector(".serial");

        if (serial)
            serial.textContent = index + 1;

    });

}

/* ==========================================================
   Row Index
========================================================== */

export function getRowIndex(row) {

    return [...tableBody.rows]
        .indexOf(row);

}

/* ==========================================================
   Update State
========================================================== */

export function updateInvoiceItem(row) {

    if (!row)
        return;

    const index = getRowIndex(row);

    if (index < 0)
        return;

    state.invoiceItems[index] = {

        product_id:
            row.querySelector(".productId").value,

        barcode:
            row.querySelector(".productBarcode").value,

        product_name:
            row.querySelector(".productName").value,

        batch:
            row.querySelector(".batch").value,

        expiry:
            row.querySelector(".expiry").value,

        hsn_code:
            row.querySelector(".hsn").value,

        quantity:
            Number(
                row.querySelector(".qty").value
            ),

        mrp:
            Number(
                row.querySelector(".mrp").value
            ),

        rate:
            Number(
                row.querySelector(".rate").value
            ),

        discount:
            Number(
                row.querySelector(".discount").value
            ),

        gst:
            Number(
                row.querySelector(".gst").value
            ),

        amount:
            Number(
                row.querySelector(".amount").value
            )

    };

}

/* ==========================================================
   Synchronize Table
========================================================== */

export function syncInvoiceItems() {

    state.invoiceItems = [];

    [...tableBody.rows].forEach(row => {

        updateInvoiceItem(row);

    });

}

/* ==========================================================
   Read Invoice Items
========================================================== */

export function getInvoiceItems() {

    syncInvoiceItems();

    return [...state.invoiceItems];

}

/* ==========================================================
   Clear Table
========================================================== */

export function clearInvoiceItems() {

    tableBody.innerHTML = "";

    state.invoiceItems = [];

    addInvoiceRow();

}

/* ==========================================================
   Get Row
========================================================== */

export function getRow(index) {

    return tableBody.rows[index] ?? null;

}

/* ==========================================================
   Table Click Events
========================================================== */

function handleTableClick(event) {

    const row = event.target.closest("tr");

    if (!row)
        return;

    /* ----------------------------------------
       Product Search
    ---------------------------------------- */

    if (
        event.target.closest(".btnProductSearch")
    ) {

        openProductSearch(row);

        return;

    }

    /* ----------------------------------------
       Delete Row
    ---------------------------------------- */

    if (
        event.target.closest(".btnDeleteRow")
    ) {

        removeInvoiceRow(row);

        return;

    }

}

/* ==========================================================
   Input Events
========================================================== */

function handleInput(event) {

    const row = event.target.closest("tr");

    if (!row)
        return;

   if (event.target.classList.contains("productBarcode")) {

    handleBarcodeSearch(event.target);

    return;

}

    updateInvoiceItem(row);

    recalculateRow(row);

}

/* ==========================================================
   Change Events
========================================================== */

function handleChange(event) {

    const row = event.target.closest("tr");

    if (!row)
        return;

    updateInvoiceItem(row);

    recalculateRow(row);

}

/* ==========================================================
   Keyboard Events
========================================================== */

function handleKeyDown(event) {

    const row = event.target.closest("tr");

    if (!row)
        return;

    switch (event.key) {

        case "Enter":

            event.preventDefault();

            focusNextField(row, event.target);

            break;

        case "Delete":

            if (event.ctrlKey) {

                event.preventDefault();

                removeInvoiceRow(row);

            }

            break;

        case "F2":

            event.preventDefault();

            openProductSearch(row);

            break;

    }

}

/* ==========================================================
   Focus Next Field
========================================================== */

function focusNextField(row, currentField) {

    const fields = [

        ".productBarcode",

        ".productName",

        ".qty",

        ".mrp",

        ".rate",

        ".discount",

        ".gst"

    ];

    const currentIndex = fields.findIndex(selector =>
        currentField.matches(selector)
    );

    if (currentIndex === -1)
        return;

    /* ----------------------------------------
       Last Field
    ---------------------------------------- */

    if (currentIndex === fields.length - 1) {

        const nextRow = row.nextElementSibling;

        if (nextRow) {

            nextRow
                .querySelector(fields[0])
                ?.focus();

            return;

        }

        const newRow = addInvoiceRow();

        newRow
            .querySelector(fields[0])
            ?.focus();

        return;

    }

    row.querySelector(
        fields[currentIndex + 1]
    )?.focus();

}

/* ==========================================================
   Barcode Search
========================================================== */

async function handleBarcodeSearch(input) {

    const barcode = input.value.trim();

    if (!barcode)
        return;

    /*
        Part 4 will connect this to api.js

        getProductByBarcode(barcode)

        and automatically fill the row.
    */

}

/* ==========================================================
   Recalculate Complete Invoice
========================================================== */

export function refreshInvoiceTable() {

    [...tableBody.rows].forEach(row => {

        updateInvoiceItem(row);

        recalculateRow(row);

    });

}

/* ==========================================================
   Load Existing Invoice
========================================================== */

export function loadInvoiceItems(items = []) {

    clearInvoiceItems();

    if (!items.length)
        return;

    tableBody.innerHTML = "";

    state.invoiceItems = [];

    items.forEach(item => {

        addInvoiceRow(item);

    });

    refreshInvoiceTable();

}

/* ==========================================================
   Invoice Total
========================================================== */

export function getGrandTotal() {

    let total = 0;

    [...tableBody.rows].forEach(row => {

        total += Number(

            row.querySelector(".amount")
                ?.value || 0

        );

    });

    return total;

}

/* ==========================================================
   Barcode Lookup
========================================================== */

async function handleBarcodeSearch(input) {

    const row = input.closest("tr");

    if (!row)
        return;

    const barcode = input.value.trim();

    if (!barcode)
        return;

    try {

        const product =
            await getProductByBarcode(barcode);

        if (!product)
            return;

        fillRow(row, product);

        const qty =
            row.querySelector(".qty");

        qty?.focus();
        qty?.select();

    }

    catch (error) {

        console.error(error);

    }

}

/* ==========================================================
   Validate Row
========================================================== */

export function validateRow(row) {

    if (!row)
        return false;

    const productName =
        row.querySelector(".productName")?.value;

    const qty =
        Number(
            row.querySelector(".qty")?.value
        );

    if (!productName)
        return false;

    if (qty <= 0)
        return false;

    return true;

}

/* ==========================================================
   Validate Complete Invoice
========================================================== */

export function validateInvoiceItems() {

    const rows = [...tableBody.rows];

    if (!rows.length)
        return false;

    for (const row of rows) {

        if (!validateRow(row))
            return false;

    }

    return true;

}

/* ==========================================================
   Find Product Row
========================================================== */

export function findProductRow(productId) {

    return [...tableBody.rows].find(row =>

        row.querySelector(".productId")
            ?.value == productId

    );

}

/* ==========================================================
   Duplicate Product Check
========================================================== */

export function addOrUpdateProduct(product) {

    const existingRow =
        findProductRow(product.id);

    if (existingRow) {

        const qty =
            existingRow.querySelector(".qty");

        qty.value =
            Number(qty.value) + 1;

        updateInvoiceItem(existingRow);

        recalculateRow(existingRow);

        qty.focus();

        return existingRow;

    }

    return addInvoiceRow(product);

}

/* ==========================================================
   Empty Row Check
========================================================== */

export function isRowEmpty(row) {

    return !row
        .querySelector(".productName")
        ?.value
        .trim();

}

/* ==========================================================
   Get Last Row
========================================================== */

export function getLastRow() {

    return tableBody.lastElementChild;

}

/* ==========================================================
   Ensure Blank Row Exists
========================================================== */

export function ensureBlankRow() {

    const lastRow = getLastRow();

    if (!lastRow) {

        addInvoiceRow();

        return;

    }

    if (!isRowEmpty(lastRow)) {

        addInvoiceRow();

    }

}

/* ==========================================================
   Table Reset
========================================================== */

export function resetInvoiceTable() {

    tableBody.innerHTML = "";

    state.invoiceItems = [];

    addInvoiceRow();

}

/* ==========================================================
   Destroy
========================================================== */

export function destroyInvoiceTable() {

    tableBody.innerHTML = "";

    state.invoiceItems = [];

    initialized = false;

}

/* ==========================================================
   Public API
========================================================== */

export default {

    initializeInvoiceTable,

    addInvoiceRow,

    removeInvoiceRow,

    fillRow,

    updateInvoiceItem,

    syncInvoiceItems,

    getInvoiceItems,

    loadInvoiceItems,

    refreshInvoiceTable,

    clearInvoiceItems,

    validateRow,

    validateInvoiceItems,

    addOrUpdateProduct,

    findProductRow,

    getGrandTotal,

    getLastRow,

    ensureBlankRow,

    resetInvoiceTable,

    destroyInvoiceTable,

    getRow,

    getRowIndex

};



