/*
==========================================================
Genius Scientific ERP
Billing Module

File:
customer.js

Purpose:
Handles all customer-related operations.

Responsibilities:
• Customer search
• Customer selection
• Customer information loading
• Autocomplete
• Keyboard navigation
• Customer state management

Author:
Genius Scientific ERP

==========================================================
*/

import { state } from "./state.js";
import * as api from "./api.js";
import * as utils from "./utils.js";

/*==========================================================
Module Variables
==========================================================*/

let customerInput = null;
let phoneInput = null;
let gstInput = null;
let addressInput = null;

let suggestionContainer = null;

let searchResults = [];

let selectedIndex = -1;

let debounceTimer = null;

/*==========================================================
Initialize Customer Module
==========================================================*/

export function initCustomer() {

    cacheDom();

    registerEvents();

    resetCustomerState();

}

/*==========================================================
Cache DOM Elements
==========================================================*/

function cacheDom() {

    customerInput = document.getElementById("customerName");

    phoneInput = document.getElementById("customerPhone");

    gstInput = document.getElementById("customerGST");

    addressInput = document.getElementById("customerAddress");

    suggestionContainer =
        document.getElementById("customerSuggestions");

}

/*==========================================================
Register Events
==========================================================*/

function registerEvents() {

    if (!customerInput) {

        console.error("Customer input not found.");

        return;

    }

    customerInput.addEventListener(

        "input",

        handleCustomerInput

    );

    customerInput.addEventListener(

        "keydown",

        handleKeyboard

    );

    customerInput.addEventListener(

        "focus",

        handleFocus

    );

    customerInput.addEventListener(

        "blur",

        handleBlur

    );

}

/*==========================================================
Input Event
==========================================================*/


/*==========================================================
Keyboard Event
==========================================================*/



/*==========================================================
Focus Event
==========================================================*/



/*==========================================================
Blur Event
==========================================================*/



/*==========================================================
Reset Customer State
==========================================================*/



/*==========================================================
Input Event
==========================================================*/

function handleCustomerInput(event) {

    const keyword = event.target.value.trim();

    clearTimeout(debounceTimer);

    if (keyword.length === 0) {

        searchResults = [];

        selectedIndex = -1;

        hideSuggestions();

        return;

    }

    debounceTimer = setTimeout(() => {

        searchCustomers(keyword);

    }, 300);

}

/*==========================================================
Search Customers
==========================================================*/

async function searchCustomers(keyword) {

    try {

        showSearchLoading();

        const customers = await api.searchCustomers(keyword);

        if (Array.isArray(customers)) {

            searchResults = customers;

        } else {

            searchResults = [];

        }

        selectedIndex = -1;

        renderSuggestions(searchResults);

    }

    catch (error) {

        console.error("Customer search failed:", error);

        searchResults = [];

        selectedIndex = -1;

        hideSuggestions();

    }

    finally {

        hideSearchLoading();

    }

}

/*==========================================================
Loading Indicator
==========================================================*/

function showSearchLoading() {

    if (!customerInput) return;

    customerInput.classList.add("loading");

}

/*==========================================================
Remove Loading Indicator
==========================================================*/

function hideSearchLoading() {

    if (!customerInput) return;

    customerInput.classList.remove("loading");

}

/*==========================================================
Hide Suggestions
==========================================================*/

function hideSuggestions() {

    if (!suggestionContainer) return;

    suggestionContainer.innerHTML = "";

    suggestionContainer.style.display = "none";

}

/*==========================================================
Render Customer Suggestions
==========================================================*/

function renderSuggestions(customers) {

    if (!suggestionContainer) return;

    suggestionContainer.innerHTML = "";

    if (!customers || customers.length === 0) {

        hideSuggestions();

        return;

    }

    customers.forEach((customer, index) => {

        const item = createSuggestionItem(customer, index);

        suggestionContainer.appendChild(item);

    });

    suggestionContainer.style.display = "block";

}

/*==========================================================
Create Suggestion Item
==========================================================*/

function createSuggestionItem(customer, index) {

    const item = document.createElement("div");

    item.className = "search-item";

    item.dataset.index = index;

    const gst = customer.gst ? customer.gst : "No GST";

    const phone = customer.phone ? customer.phone : "";

    item.innerHTML = `
        <div class="fw-semibold">${escapeHtml(customer.name)}</div>

        <small class="text-muted">

            ${phone}

            ${phone && gst ? " | " : ""}

            ${gst}

        </small>
    `;

    item.addEventListener("mousedown", function (event) {

        event.preventDefault();

        selectCustomer(customer);

    });

    return item;

}

/*==========================================================
Focus Event
==========================================================*/

function handleFocus() {

    if (searchResults.length > 0) {

        renderSuggestions(searchResults);

    }

}

/*==========================================================
Blur Event
==========================================================*/

function handleBlur() {

    setTimeout(() => {

        hideSuggestions();

    }, 150);

}

/*==========================================================
Escape HTML
==========================================================*/

function escapeHtml(text) {

    if (!text) return "";

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

/*==========================================================
Keyboard Navigation
==========================================================*/

function handleKeyboard(event) {

    if (searchResults.length === 0) return;

    switch (event.key) {

        case "ArrowDown":

            event.preventDefault();

            moveSelectionDown();

            break;

        case "ArrowUp":

            event.preventDefault();

            moveSelectionUp();

            break;

        case "Enter":

            event.preventDefault();

            if (selectedIndex >= 0) {

                selectCustomer(searchResults[selectedIndex]);

            }

            break;

        case "Escape":

            event.preventDefault();

            hideSuggestions();

            break;

        case "Tab":

            if (selectedIndex >= 0) {

                selectCustomer(searchResults[selectedIndex]);

            }

            break;

    }

}

/*==========================================================
Move Selection Down
==========================================================*/

function moveSelectionDown() {

    if (searchResults.length === 0) return;

    if (selectedIndex < searchResults.length - 1) {

        selectedIndex++;

    }

    updateSelection();

}

/*==========================================================
Move Selection Up
==========================================================*/

function moveSelectionUp() {

    if (searchResults.length === 0) return;

    if (selectedIndex > 0) {

        selectedIndex--;

    }

    updateSelection();

}

/*==========================================================
Update Selected Item
==========================================================*/

function updateSelection() {

    if (!suggestionContainer) return;

    const items = suggestionContainer.querySelectorAll(".search-item");

    items.forEach(item => {

        item.classList.remove("active");

    });

    if (
        selectedIndex >= 0 &&
        selectedIndex < items.length
    ) {

        const selectedItem = items[selectedIndex];

        selectedItem.classList.add("active");

        scrollItemIntoView(selectedItem);

    }

}

/*==========================================================
Keep Selected Item Visible
==========================================================*/

function scrollItemIntoView(item) {

    item.scrollIntoView({

        block: "nearest",

        behavior: "smooth"

    });

}

/*==========================================================
Select Customer
==========================================================*/

function selectCustomer(customer) {

    if (!customer) return;

    state.customer = {

        id: customer.id,

        name: customer.name || "",

        phone: customer.phone || "",

        email: customer.email || "",

        gst: customer.gst || "",

        address: customer.address || "",

        opening_balance: Number(customer.opening_balance || 0)

    };

    fillCustomerFields();

    hideSuggestions();

    selectedIndex = -1;

    searchResults = [];

    customerInput.focus();

}

/*==========================================================
Fill Customer Fields
==========================================================*/

function fillCustomerFields() {

    if (!state.customer) return;

    customerInput.value = state.customer.name;

    phoneInput.value = state.customer.phone;

    gstInput.value = state.customer.gst;

    addressInput.value = state.customer.address;

}

/*==========================================================
Get Selected Customer
==========================================================*/

export function getSelectedCustomer() {

    return state.customer;

}

/*==========================================================
Check Customer Selected
==========================================================*/

export function hasCustomer() {

    return state.customer !== null;

}

/*==========================================================
Get Customer ID
==========================================================*/

export function getCustomerId() {

    if (!state.customer) return null;

    return state.customer.id;

}

/*==========================================================
Refresh Customer
==========================================================*/

export async function refreshCustomer() {

    if (!state.customer) return;

    try {

        const customer = await api.getCustomerById(
            state.customer.id
        );

        if (!customer) return;

        state.customer = {

            id: customer.id,

            name: customer.name || "",

            phone: customer.phone || "",

            email: customer.email || "",

            gst: customer.gst || "",

            address: customer.address || "",

            opening_balance: Number(customer.opening_balance || 0)

        };

        fillCustomerFields();

    }

    catch (error) {

        console.error(
            "Unable to refresh customer.",
            error
        );

    }

}

/*==========================================================
Reset Customer State
==========================================================*/

function resetCustomerState() {

    state.customer = null;

    searchResults = [];

    selectedIndex = -1;

}

/*==========================================================
Clear Customer
==========================================================*/

export function clearCustomer() {

    resetCustomerState();

    if (customerInput) {

        customerInput.value = "";

    }

    if (phoneInput) {

        phoneInput.value = "";

    }

    if (gstInput) {

        gstInput.value = "";

    }

    if (addressInput) {

        addressInput.value = "";

    }

    hideSuggestions();

    notifyCustomerChanged();

}

/*==========================================================
Clear Search Results
==========================================================*/

function clearSearchResults() {

    searchResults = [];

    selectedIndex = -1;

    hideSuggestions();

}

/*==========================================================
Reset Customer Form
==========================================================*/

export function resetCustomerForm() {

    clearCustomer();

    if (customerInput) {

        customerInput.focus();

    }

}

/*==========================================================
Notify Other Modules
==========================================================*/

function notifyCustomerChanged() {

    document.dispatchEvent(

        new CustomEvent(

            "customerChanged",

            {

                detail: {

                    customer: state.customer

                }

            }

        )

    );

}

/*==========================================================
Customer Selected Notification
==========================================================*/

function notifyCustomerSelected() {

    document.dispatchEvent(

        new CustomEvent(

            "customerSelected",

            {

                detail: {

                    customer: state.customer

                }

            }

        )

    );

}

/*==========================================================
Highlight Search Text
==========================================================*/

function highlightText(text, keyword) {

    if (!text || !keyword) return escapeHtml(text);

    const escaped = escapeHtml(text);

    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(`(${escapedKeyword})`, "ig");

    return escaped.replace(regex, "<mark>$1</mark>");

}

/*==========================================================
Is Same Search
==========================================================*/

function isSameSearch(keyword) {

    return state.customerSearchKeyword === keyword;

}

/*==========================================================
Save Search Keyword
==========================================================*/

function saveSearchKeyword(keyword) {

    state.customerSearchKeyword = keyword;

}

/*==========================================================
Clear Search Keyword
==========================================================*/

function clearSearchKeyword() {

    state.customerSearchKeyword = "";

}

/*==========================================================
Cache Recent Customers
==========================================================*/

function cacheCustomers(customers) {

    state.customerCache = customers;

}

/*==========================================================
Get Cached Customers
==========================================================*/

function getCachedCustomers() {

    return state.customerCache || [];

}

/*==========================================================
Clear Customer Cache
==========================================================*/

function clearCustomerCache() {

    state.customerCache = [];

}

/*==========================================================
Show Search Error
==========================================================*/

function showSearchError(message) {

    console.error(message);

    hideSuggestions();

}

/*==========================================================
Validate Customer Object
==========================================================*/

function isValidCustomer(customer) {

    return (

        customer &&

        typeof customer === "object" &&

        customer.id !== undefined &&

        customer.name !== undefined

    );

}

/*==========================================================
Prepare Customer Object
==========================================================*/

function normalizeCustomer(customer) {

    return {

        id: customer.id,

        name: customer.name || "",

        phone: customer.phone || "",

        email: customer.email || "",

        gst: customer.gst || "",

        address: customer.address || "",

        opening_balance: Number(customer.opening_balance || 0)

    };

}

