/* ==========================================================
   Genius Scientific ERP
   customer.js
   Part 1
========================================================== */

import { state } from "./state.js";

import { qs } from "./utils.js";

import {
    searchCustomers,
    getCustomer
} from "./api.js";

let initialized = false;

/* ==========================================================
   Elements
========================================================== */

let txtCustomerId = null;
let txtCustomerName = null;
let txtCustomerPhone = null;
let txtCustomerEmail = null;
let txtCustomerAddress = null;
let txtCustomerGSTIN = null;

let btnCustomerSearch = null;
let btnNewCustomer = null;

/* ==========================================================
   Initialize
========================================================== */

export function initializeCustomer() {

    if (initialized) return;

    initialized = true;

    cacheElements();

    registerEvents();

    console.log("[Customer] Initialized");

}

/* ==========================================================
   Cache Elements
========================================================== */

function cacheElements() {

    txtCustomerId =
        qs("#customerId");

    txtCustomerName =
        qs("#customerName");

    txtCustomerPhone =
        qs("#customerPhone");

    txtCustomerEmail =
        qs("#customerEmail");

    txtCustomerAddress =
        qs("#customerAddress");

    txtCustomerGSTIN =
        qs("#customerGSTIN");

    btnCustomerSearch =
        qs("#btnCustomerSearch");

    btnNewCustomer =
        qs("#btnNewCustomer");

}

/* ==========================================================
   Register Events
========================================================== */

function registerEvents() {

    btnCustomerSearch?.addEventListener(

        "click",

        openCustomerSearch

    );

    btnNewCustomer?.addEventListener(

        "click",

        clearCustomer

    );

    txtCustomerName?.addEventListener(

    "input",

    onCustomerSearchInput

);

txtCustomerPhone?.addEventListener(

    "input",

    onCustomerSearchInput

);

    txtCustomerName?.addEventListener(

        "change",

        syncCustomerState

    );

    txtCustomerPhone?.addEventListener(

        "change",

        syncCustomerState

    );

    txtCustomerEmail?.addEventListener(

        "change",

        syncCustomerState

    );

    txtCustomerAddress?.addEventListener(

        "change",

        syncCustomerState

    );

    txtCustomerGSTIN?.addEventListener(

        "change",

        syncCustomerState

    );

}

/* ==========================================================
   Open Customer Search
========================================================== */

async function openCustomerSearch() {

    console.log(
        "[Customer] Search requested."
    );

}

/* ==========================================================
   Load Customer
========================================================== */

export async function loadCustomer(customerId) {

    if (!customerId)
        return;

    const customer =
        await getCustomer(customerId);

    if (!customer)
        return;

    populateCustomer(customer);

}

/* ==========================================================
   Populate Customer
========================================================== */

function populateCustomer(customer) {

    txtCustomerId.value =
        customer.id ?? "";

    txtCustomerName.value =
        customer.name ?? "";

    txtCustomerPhone.value =
        customer.phone ?? "";

    txtCustomerEmail.value =
        customer.email ?? "";

    txtCustomerAddress.value =
        customer.address ?? "";

    txtCustomerGSTIN.value =
        customer.gstin ?? "";

    syncCustomerState();

}

/* ==========================================================
   Customer Search
========================================================== */

let customerResults = [];

/* ==========================================================
   Search Customers
========================================================== */

export async function searchCustomer(keyword = "") {

    try {

        customerResults = await searchCustomers(keyword);

        renderCustomerResults(customerResults);

    }

    catch (error) {

        console.error(
            "[Customer] Search Failed",
            error
        );

    }

}

/* ==========================================================
   Render Customer Results
========================================================== */

function renderCustomerResults(customers) {

    console.log(
        `[Customer] ${customers.length} customer(s) found.`
    );

    /*
        Part 4 will replace this with
        history/customer modal rendering.

        This function will populate

        customerModal.html
    */

}

/* ==========================================================
   Select Customer
========================================================== */

export function selectCustomer(customer) {

    if (!customer)
        return;

    populateCustomer(customer);

}

/* ==========================================================
   Select Customer By Id
========================================================== */

export async function selectCustomerById(id) {

    if (!id)
        return;

    const customer =
        await getCustomer(id);

    if (!customer)
        return;

    populateCustomer(customer);

}

/* ==========================================================
   Customer Search Input
========================================================== */

export async function onCustomerSearchInput(event) {

    const keyword =
        event.target.value.trim();

    await searchCustomer(keyword);

}

/* ==========================================================
   Search Button
========================================================== */

async function openCustomerSearch() {

    await searchCustomer("");

    console.log(
        "[Customer] Open Search Modal"
    );

}

