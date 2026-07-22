/*
==========================================================
Genius Scientific ERP
Billing Module

File:
startup.js

Purpose:
Application startup.

Responsibilities

• Initialize billing application
• Initialize all modules
• Load startup data
• Handle startup errors

==========================================================
*/

/*==========================================================
API
==========================================================*/

import {

    pingDatabase,
    getNextInvoiceNumber

} from "./api.js";

/*==========================================================
State
==========================================================*/

import {

    initializeState

} from "./state.js";

/*==========================================================
Customer
==========================================================*/

import {

    initCustomer

} from "./customer.js";

/*==========================================================
Product Search
==========================================================*/

import {

    initProductSearch

} from "./productSearch.js";

/*==========================================================
Invoice
==========================================================*/

import {

    initInvoice

} from "./invoice.js";

/*==========================================================
Invoice Table
==========================================================*/

import {

    initInvoiceTable

} from "./invoiceTable.js";

/*==========================================================
Calculations
==========================================================*/

import {

    initCalculations

} from "./calculations.js";

/*==========================================================
Payment
==========================================================*/

import {

    initPayment

} from "./payment.js";

/*==========================================================
History
==========================================================*/

import {

    initHistory

} from "./history.js";

/*==========================================================
Dashboard
==========================================================*/

import {

    initDashboard

} from "./dashboard.js";

/*==========================================================
Keyboard
==========================================================*/

import {

    initKeyboard

} from "./keyboard.js";

/*==========================================================
Notifications
==========================================================*/

import {

    initNotifications

} from "./notifications.js";
/*==========================================================
Private Helpers
==========================================================*/

/**
 * Verify database connectivity
 */
async function checkDatabase() {

    await pingDatabase();

    console.log(
        "[Startup] Database connected."
    );

}

/**
 * Initialize application state
 */
function initializeApplicationState() {

    initializeState();

    console.log(
        "[Startup] State initialized."
    );

}

/**
 * Initialize all modules
 */
function initializeModules() {

    initNotifications();

    initCustomer();

    initProductSearch();

    initInvoice();

    initInvoiceTable();

    initCalculations();

    initPayment();

    initHistory();

    initDashboard();

    initKeyboard();

    console.log(
        "[Startup] Modules initialized."
    );

}

/**
 * Load next invoice number
 */
async function loadNextInvoiceNumber() {

    const invoiceNumber = await getNextInvoiceNumber();

    console.log(
        "[Startup] Next Invoice:",
        invoiceNumber
    );

    return invoiceNumber;

}
/*==========================================================
Public API
==========================================================*/

/**
 * Initialize Billing Module
 */
export async function initBilling() {

    try {

        console.log(
            "[Startup] Initializing Billing..."
        );

        await checkDatabase();

        initializeApplicationState();

        initializeModules();

        await loadNextInvoiceNumber();

        console.log(
            "[Startup] Billing initialized successfully."
        );

        return true;

    }

    catch (error) {

        console.error(
            "[Startup] Initialization failed.",
            error
        );

        throw error;

    }

}
/*==========================================================
Startup Loaders
==========================================================*/

/**
 * Load today's date
 */
function loadTodayDate() {

    const element = document.getElementById("invoiceDate");

    if (!element) {

        return;

    }

    const today = new Date();

    element.value = today.toISOString().split("T")[0];

}

/**
 * Focus customer search
 */
function focusCustomerInput() {

    const element = document.getElementById("customerSearch");

    if (!element) {

        return;

    }

    requestAnimationFrame(() => {

        element.focus();

    });

}

/**
 * Run startup loaders
 */
async function runStartupLoaders() {

    await loadNextInvoiceNumber();

    loadTodayDate();

    focusCustomerInput();

    console.log(

        "[Startup] Startup data loaded."

    );

}
