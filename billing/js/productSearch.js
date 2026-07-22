/*
==========================================================
Genius Scientific ERP
Billing Module

File:
productSearch.js

Purpose:
Manage product searching and product selection.

Responsibilities

• Product Search
• Product Autocomplete
• Search Results
• Product Selection
• Keyboard Navigation
• Return Selected Product

==========================================================
*/

/*==========================================================
API
==========================================================*/

import {

    searchProducts as searchProductsApi

} from "./api.js";
/*==========================================================
State
==========================================================*/

import {

    state

} from "./state.js";

/*==========================================================
Notifications
==========================================================*/

import {

    showError,
    showWarning

} from "./notifications.js";

/*==========================================================
Utilities
==========================================================*/

import {

    debounce,
    isEmpty,
    sanitizeString

} from "./utils.js";
/*==========================================================
Private Variables
==========================================================*/

let elements = {

    searchInput: null,

    searchButton: null,

    searchModal: null,

    resultsContainer: null,

    noResults: null

};

let searchResults = [];

let selectedIndex = -1;

/*==========================================================
Cache DOM
==========================================================*/

function cacheDom() {

    elements.searchInput =
        document.getElementById("productSearchInput");

    elements.searchButton =
        document.getElementById("productSearchButton");

    elements.searchModal =
        document.getElementById("productSearchModal");

    elements.resultsContainer =
        document.getElementById("productSearchResults");

    elements.noResults =
        document.getElementById("productNoResults");

}

/*==========================================================
Private Getters
==========================================================*/

function getElements() {

    return elements;

}

function hasCachedDom() {

    return Object
        .values(elements)
        .every(element => element !== null);

}

function getSearchResults() {

    return searchResults;

}

function setSearchResults(results = []) {

    searchResults = Array.isArray(results)
        ? results
        : [];

}

function getSelectedIndex() {

    return selectedIndex;

}

function setSelectedIndex(index) {

    selectedIndex = index;

}
/*==========================================================
Product Search Helpers
==========================================================*/

/**
 * Fetch matching products
 */
async function fetchProducts(keyword) {

    const searchText = sanitizeString(keyword);

    if (isEmpty(searchText)) {

        setSearchResults([]);

        renderResults();

        return;

    }

    try {

        const products = await searchProductsApi(searchText);

        setSearchResults(products);

        setSelectedIndex(-1);

        renderResults();

    } catch (error) {

        console.error(error);

        showError("Unable to search products.");

    }

}

/**
 * Render search results
 */
function renderResults() {

    if (!elements.resultsContainer) {

        return;

    }

    elements.resultsContainer.innerHTML = "";

    const results = getSearchResults();

    if (!results.length) {

        if (elements.noResults) {

            elements.noResults.classList.remove("d-none");

        }

        return;

    }

    if (elements.noResults) {

        elements.noResults.classList.add("d-none");

    }

    results.forEach((product, index) => {

        const item = document.createElement("button");

        item.type = "button";

        item.className =
            "list-group-item list-group-item-action";

        item.dataset.index = index;

        item.textContent =
            `${product.product_name} (${product.product_code})`;

        item.addEventListener("click", () => {

            chooseProduct(index);

        });

        elements.resultsContainer.appendChild(item);

    });

}

/**
 * Highlight selected result
 */
function highlightResult() {

    if (!elements.resultsContainer) {

        return;

    }

    const items =
        elements.resultsContainer.querySelectorAll(
            ".list-group-item"
        );

    items.forEach((item, index) => {

        item.classList.toggle(

            "active",

            index === getSelectedIndex()

        );

    });

}

/**
 * Reset search
 */
function resetSearch() {

    if (elements.searchInput) {

        elements.searchInput.value = "";

    }

    setSearchResults([]);

    setSelectedIndex(-1);

    renderResults();

}
/*==========================================================
Event Handlers
==========================================================*/

/**
 * Handle search input
 */
const handleSearchInput = debounce(async () => {

    if (!elements.searchInput) {

        return;

    }

    await fetchProducts(

        elements.searchInput.value

    );

}, 300);

/**
 * Move selection
 */
function moveSelection(direction) {

    const results = getSearchResults();

    if (!results.length) {

        return;

    }

    let index = getSelectedIndex();

    index += direction;

    if (index < 0) {

        index = results.length - 1;

    }

    if (index >= results.length) {

        index = 0;

    }

    setSelectedIndex(index);

    highlightResult();

}

/**
 * Choose selected product
 */
function chooseProduct(index) {

    const results = getSearchResults();

    if (!results[index]) {

        return;

    }

    state.selectedProduct = results[index];

    resetSearch();

}

/**
 * Handle keyboard navigation
 */
function handleKeyDown(event) {

    switch (event.key) {

        case "ArrowDown":

            event.preventDefault();

            moveSelection(1);

            break;

        case "ArrowUp":

            event.preventDefault();

            moveSelection(-1);

            break;

        case "Enter":

            event.preventDefault();

            if (getSelectedIndex() >= 0) {

                chooseProduct(

                    getSelectedIndex()

                );

            }

            break;

        case "Escape":

            resetSearch();

            break;

        default:

            break;

    }

}

/**
 * Register Events
 */
function registerEvents() {

    if (elements.searchInput) {

        elements.searchInput.addEventListener(

            "input",

            handleSearchInput

        );

        elements.searchInput.addEventListener(

            "keydown",

            handleKeyDown

        );

    }

    if (elements.searchButton) {

        elements.searchButton.addEventListener(

            "click",

            async () => {

                await fetchProducts(

                    elements.searchInput.value

                );

            }

        );

    }

}
/*==========================================================
Public API
==========================================================*/

/**
 * Initialize Product Search Module
 */
export function initProductSearch() {

    cacheDom();

    if (!hasCachedDom()) {

        console.warn(

            "[Product Search] Required elements not found."

        );

        return false;

    }

    registerEvents();

    resetSearch();

    console.log(

        "[Product Search] Module initialized."

    );

    return true;

}

/**
 * Open Product Search
 */
export function openProductSearch() {

    if (elements.searchModal) {

        elements.searchModal.classList.add("show");

        elements.searchModal.style.display = "block";

    }

    if (elements.searchInput) {

        elements.searchInput.focus();

    }

}

/**
 * Close Product Search
 */
export function closeProductSearch() {

    if (elements.searchModal) {

        elements.searchModal.classList.remove("show");

        elements.searchModal.style.display = "none";

    }

    resetSearch();

}

/**
 * Search Products
 */
export async function searchProducts(keyword) {

    await fetchProducts(keyword);

}

}

/**
 * Select Product
 */
export function selectProduct(index) {

    const results = getSearchResults();

    if (!results[index]) {

        return null;

    }

    chooseProduct(index);

    return results[index];

}

/**
 * Clear Product Search
 */
export function clearProductSearch() {

    resetSearch();

}
