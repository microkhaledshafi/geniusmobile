/*
=========================================================
Genius Scientific ERP
state.js
=========================================================
Global Application State
=========================================================
*/

export const state = {

    /*----------------------------------------------------
    APP
    ----------------------------------------------------*/

    initialized: false,
    loading: false,
    editMode: false,

    /*----------------------------------------------------
    COMPANY
    ----------------------------------------------------*/

    company: {
        name: "",
        state: "Jammu & Kashmir",
        gstin: ""
    },

    /*----------------------------------------------------
    USER
    ----------------------------------------------------*/

    user: null,

    /*----------------------------------------------------
    CUSTOMERS
    ----------------------------------------------------*/

    customers: [],
    customer: null,

    /*----------------------------------------------------
    PRODUCTS
    ----------------------------------------------------*/

    products: [],
    selectedProduct: null,

    /*----------------------------------------------------
    INVOICE
    ----------------------------------------------------*/

   currentInvoice: null,
lastInvoiceNumber: "",
invoiceNumber: "",
invoiceDate: "",
invoiceItems: [],

    /*----------------------------------------------------
    PAYMENT
    ----------------------------------------------------*/

    payment: {

        mode: "Cash",

        status: "Paid",

        receivedAmount: 0,

        balanceAmount: 0

    },

    /*----------------------------------------------------
    TOTALS
    ----------------------------------------------------*/

    totals: {

        totalQty: 0,

        taxableValue: 0,

        discount: 0,

        cgst: 0,

        sgst: 0,

        igst: 0,

        gst: 0,

        roundOff: 0,

        grandTotal: 0

    },

    /*----------------------------------------------------
    DASHBOARD
    ----------------------------------------------------*/

    dashboard: {

        todaySales: 0,

        todayInvoices: 0,

        todayItems: 0,

        pendingAmount: 0

    },

    /*----------------------------------------------------
    HISTORY
    ----------------------------------------------------*/

    history: [],

    /*----------------------------------------------------
    SEARCH
    ----------------------------------------------------*/

    search: {

        productKeyword: "",

        customerKeyword: "",

        activeRow: null

    },

    /*----------------------------------------------------
    SETTINGS
    ----------------------------------------------------*/

    settings: {

        companyState: "Jammu & Kashmir",

        currency: "₹",

        decimalPlaces: 2

    },

    /*----------------------------------------------------
    FLAGS
    ----------------------------------------------------*/

    flags: {

        invoiceChanged: false,

        saving: false,

        printing: false

    }

};

/*=========================================================
RESET INVOICE STATE
=========================================================*/

export function resetInvoiceState() {

    state.currentInvoice = null;

    state.lastInvoiceNumber = "";

    state.selectedProduct = null;

    state.invoiceItems = [];

    state.customer = null;

    state.invoiceNumber = "";

    state.invoiceDate = "";

    state.payment = {

        mode: "Cash",

        status: "Paid",

        receivedAmount: 0,

        balanceAmount: 0

    };

    state.totals = {

        totalQty: 0,

        taxableValue: 0,

        discount: 0,

        cgst: 0,

        sgst: 0,

        igst: 0,

        gst: 0,

        roundOff: 0,

        grandTotal: 0

    };

    state.flags.invoiceChanged = false;

}

/*=========================================================
MARK CHANGED
=========================================================*/

export function markInvoiceChanged() {

    state.flags.invoiceChanged = true;

}

/*=========================================================
CLEAR CHANGED
=========================================================*/

export function clearInvoiceChanged() {

    state.flags.invoiceChanged = false;

}
