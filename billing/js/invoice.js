import { state } from "./state.js";
import { today } from "./utils.js";

export function initInvoice() {

    generateInvoiceNumber();

    loadToday();

    attachEvents();

}

function loadToday() {

    document.getElementById("invoiceDate").value = today();

}

function generateInvoiceNumber() {

    const year = new Date().getFullYear();

    const invoiceNo =
        `INV-${year}-${Date.now().toString().slice(-6)}`;

    document.getElementById("invoiceNo").value = invoiceNo;

    state.currentInvoice = invoiceNo;

}

function attachEvents() {

    document
        .getElementById("btnNewInvoice")
        .addEventListener(
            "click",
            generateInvoiceNumber
        );

}
