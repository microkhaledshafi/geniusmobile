/* ==========================================================
   Genius Scientific ERP
   invoiceHistory.js
   Part 1
========================================================== */

import {

    searchInvoices,
    getInvoiceById

} from "./api.js";

/* ==========================================================
   Module State
========================================================== */

const historyState = {

    invoices: [],

    filteredInvoices: [],

    selectedInvoice: null,

    selectedIndex: -1,

    initialized: false

};

let historyModal = null;

/* ==========================================================
   Helpers
========================================================== */

function qs(id) {

    return document.getElementById(id);

}

function value(id) {

    return qs(id)?.value?.trim() || "";

}

function setHTML(id, html) {

    const element = qs(id);

    if (!element)
        return;

    element.innerHTML = html;

}

/* ==========================================================
   Modal
========================================================== */

function getHistoryModal() {

    if (!historyModal) {

        historyModal =

            new bootstrap.Modal(

                qs("invoiceHistoryModal")

            );

    }

    return historyModal;

}

export function openInvoiceHistory() {

    getHistoryModal().show();

    clearSearch();

    focusSearch();

}

export function closeInvoiceHistory() {

    getHistoryModal().hide();

}

/* ==========================================================
   Search Helpers
========================================================== */

function clearSearch() {

    const searchBox =

        qs("txtInvoiceSearch");

    if (searchBox)
        searchBox.value = "";

}

function focusSearch() {

    qs("txtInvoiceSearch")?.focus();

}

/* ==========================================================
   End Part 1
========================================================== */

/* ==========================================================
   Load Invoice Cache
========================================================== */

async function loadInvoiceCache() {

    historyState.invoices =

        await searchInvoices("");

    historyState.filteredInvoices =

        [...historyState.invoices];

    historyState.selectedIndex = -1;

}

/* ==========================================================
   Refresh Invoice History
========================================================== */

export async function refreshInvoiceHistory() {

    await loadInvoiceCache();

}

/* ==========================================================
   Search Invoices
========================================================== */

async function searchInvoice(keyword) {

    const text =

        keyword.trim().toLowerCase();

    if (!text) {

        historyState.filteredInvoices =

            [...historyState.invoices];

    }

    else {

        historyState.filteredInvoices =

            historyState.invoices.filter(invoice =>

                getInvoiceSearchText(invoice)

                    .includes(text)

            );

    }

    historyState.selectedIndex = -1;

    renderInvoiceResults();

}

/* ==========================================================
   Invoice Search Text
========================================================== */

function getInvoiceSearchText(invoice) {

    return [

        invoice.invoiceNumber,

        invoice.customerName,

        invoice.customerPhone,

        invoice.invoiceDate,

        invoice.reference

    ]

        .filter(Boolean)

        .join(" ")

        .toLowerCase();

}

/* ==========================================================
   Render Results
========================================================== */

function renderInvoiceResults() {

    const container =

        qs("invoiceHistoryResults");

    if (!container)
        return;

    container.innerHTML = "";

    historyState.filteredInvoices.forEach(

        (invoice, index) => {

            const row =

                document.createElement("button");

            row.type = "button";

            row.dataset.index = index;

            row.className =

                "list-group-item list-group-item-action";

            row.innerHTML = `

<div class="d-flex justify-content-between">

    <div>

        <div class="fw-bold">

            ${invoice.invoiceNumber}

        </div>

        <small>

            ${invoice.customerName || ""}

        </small>

    </div>

    <div class="text-end">

        <div>

            ₹${Number(

                invoice.grandTotal || 0

            ).toFixed(2)}

        </div>

        <small>

            ${invoice.invoiceDate || ""}

        </small>

    </div>

</div>

`;

            row.addEventListener(

                "click",

                () => {

                    selectInvoice(index);

                }

            );

            container.appendChild(row);

        }

    );

}

function formatCurrency(amount) {

    return Number(amount || 0)

        .toLocaleString(

            "en-IN",

            {

                style: "currency",

                currency: "INR"

            }

        );

}

function formatCurrency(amount) {

    return Number(amount || 0)

        .toLocaleString(

            "en-IN",

            {

                style: "currency",

                currency: "INR"

            }

        );

}

/* ==========================================================
   Imports
========================================================== */

import {

    loadInvoiceItems

} from "./invoiceTable.js";

import {

    refreshInvoiceTotals

} from "./calculations.js";

import {

    refreshPayment

} from "./payment.js";

/* ==========================================================
   Select Invoice
========================================================== */

export async function selectInvoice(index) {

    const invoice =

        historyState.filteredInvoices[index];

    if (!invoice)
        return;

    try {

        const data =

            await getInvoiceById(

                invoice.id

            );

        if (!data)
            return;

        historyState.selectedInvoice =

            data;

        loadInvoice(data);

        closeInvoiceHistory();

    }

    catch (error) {

        console.error(

            "[Invoice History]",

            error

        );

    }

}

/* ==========================================================
   Load Invoice
========================================================== */

function loadInvoice(invoice) {

    loadInvoiceHeader(

        invoice.header

    );

    loadInvoiceCustomer(

        invoice.customer

    );

    loadInvoiceItems(

        invoice.items || []

    );

    refreshInvoiceTotals();

    refreshPayment();

}

/* ==========================================================
   Load Header
========================================================== */

function loadInvoiceHeader(header) {

    setValue(

        "invoiceNumber",

        header.invoiceNumber

    );

    setValue(

        "invoiceDate",

        header.invoiceDate

    );

    setValue(

        "invoiceReference",

        header.invoiceReference

    );

    setValue(

        "salesPerson",

        header.salesPerson

    );

    setValue(

        "invoiceRemarks",

        header.remarks

    );

}

/* ==========================================================
   Load Customer
========================================================== */

function loadInvoiceCustomer(customer) {

    if (!customer)
        return;

    setValue(

        "customerId",

        customer.id

    );

    setValue(

        "customerName",

        customer.name

    );

    setValue(

        "customerPhone",

        customer.phone

    );

    setValue(

        "customerEmail",

        customer.email

    );

    setValue(

        "customerGSTIN",

        customer.gstin

    );

    setValue(

        "customerAddress",

        customer.address

    );

}
