/* ==========================================================
   Genius Scientific ERP
   startup.js
========================================================== */

import { initializeAPI } from "./api.js";

import { initializeInvoice } from "./invoice.js";

import { initializeCustomer } from "./customer.js";

import { initializeProductSearch } from "./productSearch.js";

import { initializeInvoiceTable } from "./invoiceTable.js";

import { initializeCalculations } from "./calculations.js";

import { initializePayment } from "./payment.js";

import { initializeSaveInvoice } from "./saveInvoice.js";

import { initializeHistory } from "./history.js";

import { initializeEditInvoice } from "./editInvoice.js";

import { initializeDeleteInvoice } from "./deleteInvoice.js";

import { initializeDashboard } from "./dashboard.js";

import { initializeKeyboard } from "./keyboard.js";

import { initializeValidation } from "./validation.js";

import { initializeNotifications } from "./notifications.js";

let initialized = false;

/* ==========================================================
   Startup
========================================================== */

export async function startup() {

    if (initialized)
        return;

    try {

        await initializeAPI();

        initializeNotifications();

        initializeValidation();

        initializeInvoice();

        initializeCustomer();

        initializeProductSearch();

        initializeInvoiceTable();

        initializeCalculations();

        initializePayment();

        initializeSaveInvoice();

        initializeHistory();

        initializeEditInvoice();

        initializeDeleteInvoice();

        await initializeDashboard();

        initializeKeyboard();

        initialized = true;

        console.log(

            "[Startup] Billing application initialized"

        );

    }

    catch (error) {

        console.error(

            "[Startup]",

            error

        );

        throw error;

    }

}

/* ==========================================================
   Shutdown
========================================================== */

export function shutdown() {

    if (!initialized)
        return;

    initialized = false;

    console.log(

        "[Startup] Billing application stopped"

    );

}

/* ==========================================================
   Status
========================================================== */

export function isInitialized() {

    return initialized;

}

/* ==========================================================
   Default Export
========================================================== */

export default {

    startup,

    shutdown,

    isInitialized

};
