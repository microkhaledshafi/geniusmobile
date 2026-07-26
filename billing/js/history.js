/* ==========================================================
   Genius Scientific ERP
   history.js
   Part 1
========================================================== */

import { qs } from "./utils.js";

import {
    getInvoices
} from "./api.js";

let initialized = false;

/* ==========================================================
   Elements
========================================================== */

let historyModal = null;

let btnHistory = null;

let btnHistoryClose = null;

let txtHistorySearch = null;

let historyTableBody = null;

/* ==========================================================
   State
========================================================== */

let historyData = [];

/* ==========================================================
   Initialize
========================================================== */

export function initializeHistory() {

    if (initialized) return;

    initialized = true;

    cacheElements();

    registerEvents();

    console.log("[History] Initialized");

}

/* ==========================================================
   Cache Elements
========================================================== */

function cacheElements() {

    historyModal =
        qs("#historyModal");

    btnHistory =
        qs("#btnHistory");

    btnHistoryClose =
        qs("#btnHistoryClose");

    txtHistorySearch =
        qs("#historySearch");

    historyTableBody =
        qs("#historyTableBody");

}

/* ==========================================================
   Register Events
========================================================== */

function registerEvents() {

    btnHistory?.addEventListener(

        "click",

        openHistory

    );

    btnHistoryClose?.addEventListener(

        "click",

        closeHistory

    );

    txtHistorySearch?.addEventListener(

        "input",

        onSearchInput

    );
   historyTableBody?.addEventListener(

    "click",

    onHistoryTableClick

);

}

/* ==========================================================
   Open History
========================================================== */

export async function openHistory() {

    await refreshHistory();

    historyModal?.classList.add("show");

}

/* ==========================================================
   Close History
========================================================== */

export function closeHistory() {

    historyModal?.classList.remove("show");

}

/* ==========================================================
   Refresh History
========================================================== */

export async function refreshHistory() {

    historyData = await getInvoices();

    renderHistory(historyData);

}

/* ==========================================================
   Get History
========================================================== */

export function getHistory() {

    return historyData;

}

/* ==========================================================
   Render History
========================================================== */

function renderHistory(invoices = []) {

    if (!historyTableBody)
        return;

    historyTableBody.innerHTML = "";

    if (!invoices.length) {

        historyTableBody.innerHTML = `

            <tr>

                <td colspan="7"
                    class="text-center text-muted">

                    No invoices found.

                </td>

            </tr>

        `;

        return;

    }

    invoices.forEach(invoice => {

        historyTableBody.appendChild(

            createHistoryRow(invoice)

        );

    });

}

/* ==========================================================
   Create History Row
========================================================== */

function createHistoryRow(invoice) {

    const tr = document.createElement("tr");

    tr.dataset.id = invoice.id;

    tr.innerHTML = `

        <td>${invoice.invoice_number}</td>

        <td>${invoice.invoice_date}</td>

        <td>${invoice.customer_name ?? ""}</td>

        <td class="text-end">

            ${Number(invoice.grand_total || 0).toFixed(2)}

        </td>

        <td>

            ${invoice.payment_status ?? ""}

        </td>

        <td>

            <button
                class="btn btn-sm btn-primary btn-history-edit"
                data-id="${invoice.id}">

                Edit

            </button>

            <button
                class="btn btn-sm btn-danger btn-history-delete"
                data-id="${invoice.id}">

                Delete

            </button>

            <button
                class="btn btn-sm btn-secondary btn-history-print"
                data-id="${invoice.id}">

                Print

            </button>

        </td>

    `;

    return tr;

}

/* ==========================================================
   Search History
========================================================== */

function searchHistory(keyword = "") {

    keyword = keyword
        .trim()
        .toLowerCase();

    if (!keyword) {

        renderHistory(historyData);

        return;

    }

    const filtered = historyData.filter(invoice => {

        return (

            String(invoice.invoice_number)
                .toLowerCase()
                .includes(keyword)

            ||

            String(invoice.customer_name ?? "")
                .toLowerCase()
                .includes(keyword)

            ||

            String(invoice.invoice_date)
                .toLowerCase()
                .includes(keyword)

        );

    });

    renderHistory(filtered);

}

/* ==========================================================
   Search Input
========================================================== */

function onSearchInput(event) {

    searchHistory(

        event.target.value

    );

}

/* ==========================================================
   History Actions
========================================================== */

import { editInvoice } from "./editInvoice.js";

import { deleteInvoice } from "./deleteInvoice.js";

/* ==========================================================
   Register Table Events
========================================================== */

historyTableBody?.addEventListener(

    "click",

    onHistoryTableClick

);

/* ==========================================================
   Table Click
========================================================== */

async function onHistoryTableClick(event) {

    const button = event.target.closest("button");

    if (!button)
        return;

    const invoiceId = button.dataset.id;

    if (!invoiceId)
        return;

    if (button.classList.contains("btn-history-edit")) {

        await onEdit(invoiceId);

        return;

    }

    if (button.classList.contains("btn-history-delete")) {

        await onDelete(invoiceId);

        return;

    }

    if (button.classList.contains("btn-history-print")) {

        await onPrint(invoiceId);

        return;

    }

}

/* ==========================================================
   Edit
========================================================== */

async function onEdit(invoiceId) {

    closeHistory();

    await editInvoice(invoiceId);

}

/* ==========================================================
   Delete
========================================================== */

async function onDelete(invoiceId) {

    const confirmed = confirm(

        "Delete this invoice?"

    );

    if (!confirmed)
        return;

    await deleteInvoice(invoiceId);

    await refreshHistory();

}

/* ==========================================================
   Print
========================================================== */

async function onPrint(invoiceId) {

    console.log(

        "[History] Print",

        invoiceId

    );

    /*
        Part of printManager.js

        Example:

        printInvoice(invoiceId);

    */

}

/* ==========================================================
   Refresh After Action
========================================================== */

export async function reloadHistory() {

    await refreshHistory();

}

/* ==========================================================
   Clear History
========================================================== */

export function clearHistory() {

    historyData = [];

    if (historyTableBody) {

        historyTableBody.innerHTML = "";

    }

}

/* ==========================================================
   Destroy History
========================================================== */

export function destroyHistory() {

    clearHistory();

    closeHistory();

}

/* ==========================================================
   Set History
========================================================== */

export function setHistory(invoices = []) {

    historyData = invoices;

    renderHistory(historyData);

}

/* ==========================================================
   History Count
========================================================== */

export function getHistoryCount() {

    return historyData.length;

}

/* ==========================================================
   Public API
========================================================== */

export default {

    initializeHistory,

    openHistory,

    closeHistory,

    refreshHistory,

    reloadHistory,

    renderHistory,

    clearHistory,

    destroyHistory,

    getHistory,

    setHistory,

    getHistoryCount

};
