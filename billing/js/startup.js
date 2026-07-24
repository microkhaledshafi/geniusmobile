/*
=========================================================
Genius Scientific ERP
startup.js
=========================================================
Application Startup
=========================================================
*/

import { initializeState } from "./state.js";

import { loadCustomers, initCustomer } from "./customer.js";

import { initializeInvoice } from "./invoice.js";

import { initializeProductSearch } from "./productSearch.js";

import { initializeInvoiceTable } from "./invoiceTable.js";

import { initializeCalculations } from "./calculations.js";

import { initializePayment } from "./payment.js";

import { initializeDashboard } from "./dashboard.js";

import { initializeHistory } from "./history.js";

import { initializeKeyboard } from "./keyboard.js";

import {
    showSuccess,
    showError
} from "./notifications.js";

/*=========================================================
START BILLING
=========================================================*/

export async function startBilling() {

    try {

        console.log("Starting Genius Scientific ERP...");

        /*----------------------------------------------
        Initialize Global State
        ----------------------------------------------*/

        initializeState();

        /*----------------------------------------------
        Customers
        ----------------------------------------------*/

        await loadCustomers();

        initCustomer();

        /*----------------------------------------------
        Invoice
        ----------------------------------------------*/

        if (typeof initializeInvoice === "function")
            initializeInvoice();

        /*----------------------------------------------
        Products
        ----------------------------------------------*/

        if (typeof initializeProductSearch === "function")
            await initializeProductSearch();

        /*----------------------------------------------
        Invoice Table
        ----------------------------------------------*/

        if (typeof initializeInvoiceTable === "function")
            initializeInvoiceTable();

        /*----------------------------------------------
        Calculations
        ----------------------------------------------*/

        if (typeof initializeCalculations === "function")
            initializeCalculations();

        /*----------------------------------------------
        Payment
        ----------------------------------------------*/

        if (typeof initializePayment === "function")
            initializePayment();

        /*----------------------------------------------
        Dashboard
        ----------------------------------------------*/

        if (typeof initializeDashboard === "function")
            await initializeDashboard();

        /*----------------------------------------------
        History
        ----------------------------------------------*/

        if (typeof initializeHistory === "function")
            initializeHistory();

        /*----------------------------------------------
        Keyboard
        ----------------------------------------------*/

        if (typeof initializeKeyboard === "function")
            initializeKeyboard();

        console.log("ERP Loaded Successfully");

        if (typeof showSuccess === "function")
            showSuccess("Billing System Ready");

    }

    catch (error) {

        console.error(error);

        if (typeof showError === "function")
            showError(error.message);

    }

}
