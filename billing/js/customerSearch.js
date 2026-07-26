/* ==========================================================
   Genius Scientific ERP
   customerSearch.js
   Part 1
========================================================== */

import {

    searchCustomers,
    getCustomerById

} from "./api.js";

/* ==========================================================
   Module State
========================================================== */

const customerState = {

    customers: [],

    filteredCustomers: [],

    selectedIndex: -1,

    selectedCustomer: null,

    initialized: false

};

let customerModal = null;

/* ==========================================================
   Helpers
========================================================== */

function qs(id) {

    return document.getElementById(id);

}

function value(id) {

    return qs(id)?.value?.trim() || "";

}

function setValue(id, value) {

    const element = qs(id);

    if (!element)
        return;

    element.value = value ?? "";

}

/* ==========================================================
   Modal
========================================================== */

function getCustomerModal() {

    if (!customerModal) {

        customerModal =

            new bootstrap.Modal(

                qs("customerModal")

            );

    }

    return customerModal;

}

export function openCustomerSearch() {

    getCustomerModal().show();

    clearSearch();

    focusSearch();

}

export function closeCustomerSearch() {

    getCustomerModal().hide();

}

/* ==========================================================
   End Part 1
========================================================== */

/* ==========================================================
   Load Customer Cache
========================================================== */

async function loadCustomerCache() {

    customerState.customers =

        await searchCustomers("");

    customerState.filteredCustomers =

        [...customerState.customers];

    customerState.selectedIndex = -1;

}

/* ==========================================================
   Refresh Customer Cache
========================================================== */

export async function refreshCustomers() {

    await loadCustomerCache();

}

/* ==========================================================
   Search Customers
========================================================== */

async function searchCustomer(keyword) {

    const text =

        keyword.trim().toLowerCase();

    if (!text) {

        customerState.filteredCustomers =

            [...customerState.customers];

    }

    else {

        customerState.filteredCustomers =

            customerState.customers.filter(customer => {

                return (

                    customer.name?.toLowerCase().includes(text) ||

                    customer.phone?.toLowerCase().includes(text) ||

                    customer.gstin?.toLowerCase().includes(text) ||

                    customer.email?.toLowerCase().includes(text)

                );

            });

    }

    customerState.selectedIndex = -1;

    renderCustomerResults();

}

/* ==========================================================
   Render Customer List
========================================================== */

function renderCustomerResults() {

    const container =

        qs("customerSearchResults");

    if (!container)
        return;

    container.innerHTML = "";

    customerState.filteredCustomers.forEach(

        (customer, index) => {

            const row =

                document.createElement("button");

            row.type = "button";

            row.className =

                "list-group-item list-group-item-action";

            row.dataset.index = index;

            row.innerHTML = `

                <div class="fw-bold">

                    ${customer.name}

                </div>

                <small>

                    ${customer.phone || ""}

                </small>

            `;

            row.addEventListener(

                "click",

                () => {

                    selectCustomer(index);

                }

            );

            container.appendChild(row);

        }

    );

}

/* ==========================================================
   Clear Search
========================================================== */

function clearSearch() {

    qs("txtCustomerSearch").value = "";

    customerState.filteredCustomers =

        [...customerState.customers];

    customerState.selectedIndex = -1;

    renderCustomerResults();

}

/* ==========================================================
   Focus Search
========================================================== */

function focusSearch() {

    qs("txtCustomerSearch")?.focus();

}

function getCustomerText(customer) {

    return [

        customer.name,

        customer.phone,

        customer.email,

        customer.gstin

    ]

        .filter(Boolean)

        .join(" ")

        .toLowerCase();

}
customerState.filteredCustomers =

    customerState.customers.filter(customer =>

        getCustomerText(customer).includes(text)

    );
function fillCustomer(customer) {

    setValue("customerId", customer.id);
    setValue("customerName", customer.name);
    setValue("customerPhone", customer.phone);
    setValue("customerEmail", customer.email);
    setValue("customerGSTIN", customer.gstin);
    setValue("customerAddress", customer.address);

}

/* ==========================================================
   Validate Customer
========================================================== */

function validateCustomer() {

    const customerId = value("customerId");

    if (!customerId) {

        return {

            valid: false,

            message: "Please select a customer."

        };

    }

    return {

        valid: true

    };

}

/* ==========================================================
   Validate Invoice Header
========================================================== */

function validateInvoiceHeader(header) {

    if (!header.invoiceNumber) {

        return {

            valid: false,

            message: "Invoice number is required."

        };

    }

    if (!header.invoiceDate) {

        return {

            valid: false,

            message: "Invoice date is required."

        };

    }

    return {

        valid: true

    };

}

/* ==========================================================
   Validate Complete Invoice
========================================================== */

function validateInvoice() {

    const header = buildInvoiceHeader();

    const headerValidation =

        validateInvoiceHeader(header);

    if (!headerValidation.valid)
        return headerValidation;

    const customerValidation =

        validateCustomer();

    if (!customerValidation.valid)
        return customerValidation;

    const itemValidation =

        validateInvoiceItems();

    if (!itemValidation.valid)
        return itemValidation;

    const paymentValidation =

        validatePayment();

    if (!paymentValidation.valid)
        return {

            valid: false,

            message: "Payment information is invalid."

        };

    return {

        valid: true,

        header

    };

}

/* ==========================================================
   Collect Invoice Items
========================================================== */

function buildInvoiceItems() {

    return getInvoiceItems()

        .filter(item =>

            item.productId

        )

        .map(item => ({

            ...item

        }));

}

/* ==========================================================
   Prepare Save Data
========================================================== */

function prepareInvoiceData() {

    const validation =

        validateInvoice();

    if (!validation.valid)
        return validation;

    const items =

        buildInvoiceItems();

    return {

        valid: true,

        header:

            validation.header,

        items

    };

}

/* ==========================================================
   Initialize
========================================================== */

export async function initializeCustomerSearch() {

    if (customerState.initialized)
        return;

    await loadCustomerCache();

    registerSearchEvents();

    customerState.initialized = true;

    console.log(
        "[Customer Search] Initialized"
    );

}

/* ==========================================================
   Public Helpers
========================================================== */

export function getSelectedCustomer() {

    return customerState.selectedCustomer;

}

export function clearSelectedCustomer() {

    customerState.selectedCustomer = null;

    setValue("customerId", "");
    setValue("customerName", "");
    setValue("customerPhone", "");
    setValue("customerEmail", "");
    setValue("customerGSTIN", "");
    setValue("customerAddress", "");

}

export function resetCustomerSearch() {

    clearSelectedCustomer();

    customerState.filteredCustomers = [
        ...customerState.customers
    ];

    customerState.selectedIndex = -1;

    clearSearch();

}

export function destroyCustomerSearch() {

    customerState.initialized = false;

    customerState.selectedCustomer = null;

    customerState.filteredCustomers = [];

    customerState.selectedIndex = -1;

}

/* ==========================================================
   Public API
========================================================== */

export default {

    initializeCustomerSearch,

    openCustomerSearch,

    closeCustomerSearch,

    refreshCustomers,

    selectCustomer,

    getSelectedCustomer,

    clearSelectedCustomer,

    resetCustomerSearch,

    destroyCustomerSearch

};
