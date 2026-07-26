/* ==========================================================
   Genius Scientific ERP
   productSearch.js
   Part 1
   Product Search Engine
========================================================== */

import {

    searchProducts,
    getProductByBarcode

} from "./api.js";

import { qs } from "./utils.js";

import {
    fillRow
} from "./invoiceTable.js";

import {

    showError

} from "./notifications.js";

/* ==========================================================
   Module State
========================================================== */

let initialized = false;

let productCache = [];

let filteredProducts = [];

let selectedRow = null;

let highlightedIndex = 0;

let modal = null;

/* ==========================================================
   Initialize
========================================================== */

export async function initializeProductSearch() {

    if (initialized)
        return;

    modal = bootstrap.Modal.getOrCreateInstance(

        qs("#productModal")

    );

    registerEvents();

    await refreshProducts();

    initialized = true;

    console.log("[ProductSearch] Initialized");

}

/* ==========================================================
   Register Events
========================================================== */

function registerEvents() {

    const txtSearch = qs("#txtProductSearch");

    txtSearch?.addEventListener(

        "input",

        event => {

            filterProducts(

                event.target.value

            );

        }

    );

    txtSearch?.addEventListener(

        "keydown",

        handleKeyboard

    );

    qs("#btnSearchProduct")

        ?.addEventListener(

            "click",

            () => {

                filterProducts(

                    txtSearch.value

                );

            }

        );

    document.addEventListener(

        "click",

        handleProductClick

    );

}

/* ==========================================================
   Refresh Products
========================================================== */

export async function refreshProducts() {

    try {

        productCache =

            await searchProducts("");

        filteredProducts =

            [...productCache];

        renderProducts();

    }

    catch (error) {

        console.error(error);

        showError(

            "Unable to load products."

        );

    }

}

/* ==========================================================
   Open Product Search
========================================================== */

export function openProductSearch(row) {

    selectedRow = row;

    highlightedIndex = 0;

    filteredProducts =

        [...productCache];

    renderProducts();

    modal.show();

    const input =

        qs("#txtProductSearch");

    if (input) {

        input.value = "";

        setTimeout(() => {

            input.focus();

        }, 150);

    }

}

/* ==========================================================
   Close Product Search
========================================================== */

export function closeProductSearch() {

    modal.hide();

}

/* ==========================================================
   Filter Products
========================================================== */

function filterProducts(searchText = "") {

    const keyword = searchText
        .trim()
        .toLowerCase();

    if (!keyword) {

        filteredProducts = [...productCache];

        highlightedIndex = 0;

        renderProducts();

        return;

    }

    filteredProducts = productCache.filter(product => {

        return (

            String(product.product_name ?? "")
                .toLowerCase()
                .includes(keyword)

            ||

            String(product.barcode ?? "")
                .toLowerCase()
                .includes(keyword)

            ||

            String(product.product_code ?? "")
                .toLowerCase()
                .includes(keyword)

            ||

            String(product.hsn_code ?? "")
                .toLowerCase()
                .includes(keyword)

            ||

            String(product.batch ?? "")
                .toLowerCase()
                .includes(keyword)

        );

    });

    highlightedIndex = 0;

    renderProducts();

}

/* ==========================================================
   Render Products
========================================================== */

function renderProducts() {

    const tbody = qs("#productSearchResults");

    if (!tbody)
        return;

    tbody.innerHTML = "";

    if (!filteredProducts.length) {

        tbody.innerHTML = `

<tr>

<td colspan="8"
class="text-center text-muted py-4">

No products found

</td>

</tr>

`;

        return;

    }

    filteredProducts.forEach(

        (product, index) => {

            tbody.appendChild(

                createProductRow(

                    product,

                    index

                )

            );

        }

    );

}

/* ==========================================================
   Create Product Row
========================================================== */

function createProductRow(product, index) {

    const tr = document.createElement("tr");

    tr.dataset.index = index;

    tr.className =
        index === highlightedIndex
            ? "table-primary"
            : "";

    tr.innerHTML = `

<td>${product.barcode ?? ""}</td>

<td>${product.product_name ?? ""}</td>

<td>${product.batch ?? ""}</td>

<td>${product.hsn_code ?? ""}</td>

<td class="text-end">

${Number(product.mrp ?? 0).toFixed(2)}

</td>

<td class="text-end">

${Number(product.rate ?? 0).toFixed(2)}

</td>

<td class="text-center">

${Number(product.gst ?? 0)}%

</td>

<td class="text-center">

${product.stock ?? "-"}

</td>

`;

    tr.addEventListener(

        "mouseenter",

        () => {

            highlightedIndex = index;

            refreshHighlight();

        }

    );

    tr.addEventListener(

        "dblclick",

        () => {

            selectHighlightedProduct();

        }

    );

    return tr;

}

/* ==========================================================
   Refresh Highlight
========================================================== */

function refreshHighlight() {

    const rows =

        qs("#productSearchResults")
            ?.querySelectorAll("tr");

    if (!rows)
        return;

    rows.forEach((row, index) => {

        row.classList.toggle(

            "table-primary",

            index === highlightedIndex

        );

    });

}

/* ==========================================================
   Scroll Highlight Into View
========================================================== */

function scrollHighlightedIntoView() {

    const rows =

        qs("#productSearchResults")
            ?.querySelectorAll("tr");

    if (!rows?.length)
        return;

    rows[highlightedIndex]
        ?.scrollIntoView({

            block: "nearest"

        });

}

/* ==========================================================
   Keyboard Navigation
========================================================== */

function handleKeyboard(event) {

    if (!filteredProducts.length)
        return;

    switch (event.key) {

        case "ArrowDown":

            event.preventDefault();

            if (highlightedIndex < filteredProducts.length - 1) {

                highlightedIndex++;

                refreshHighlight();

                scrollHighlightedIntoView();

            }

            break;

        case "ArrowUp":

            event.preventDefault();

            if (highlightedIndex > 0) {

                highlightedIndex--;

                refreshHighlight();

                scrollHighlightedIntoView();

            }

            break;

        case "Enter":

            event.preventDefault();

            selectHighlightedProduct();

            break;

        case "Escape":

            event.preventDefault();

            closeProductSearch();

            break;

    }

}

/* ==========================================================
   Mouse Click Selection
========================================================== */

function handleProductClick(event) {

    const row = event.target.closest(

        "#productSearchResults tr"

    );

    if (!row)
        return;

    highlightedIndex = Number(

        row.dataset.index

    );

    refreshHighlight();

}

/* ==========================================================
   Select Highlighted Product
========================================================== */

function selectHighlightedProduct() {

    const product =

        filteredProducts[highlightedIndex];

    if (!product)
        return;

    selectProduct(product);

}

/* ==========================================================
   Select Product
========================================================== */

export function selectProduct(product) {

    if (!product)
        return;

    if (selectedRow) {

        fillRow(

            selectedRow,

            product

        );

    }

    else {

        addOrUpdateProduct(

            product

        );

    }

    closeProductSearch();

}

/* ==========================================================
   Barcode Search
========================================================== */

export async function searchBarcode(barcode) {

    barcode = barcode.trim();

    if (!barcode)
        return null;

    try {

        const product =

            await getProductByBarcode(

                barcode

            );

        if (!product)
            return null;

        return product;

    }

    catch (error) {

        console.error(error);

        return null;

    }

}

/* ==========================================================
   Barcode Fill Helper
========================================================== */

export async function fillProductFromBarcode(

    row,
    barcode

) {

    const product =

        await searchBarcode(

            barcode

        );

    if (!product)
        return false;

    fillRow(

        row,
        product

    );

    return true;

}

/* ==========================================================
   Search Helpers
========================================================== */

export function getFilteredProducts() {

    return [...filteredProducts];

}

export function getProductCache() {

    return [...productCache];

}

export function clearSearchBox() {

    const input =

        qs("#txtProductSearch");

    if (input)
        input.value = "";

}

export function focusSearchBox() {

    const input =

        qs("#txtProductSearch");

    input?.focus();

    input?.select();

}

/* ==========================================================
   Reset Search
========================================================== */

export function resetProductSearch() {

    filteredProducts = [...productCache];

    highlightedIndex = 0;

    selectedRow = null;

    clearSearchBox();

    renderProducts();

}

/* ==========================================================
   Reload Product Cache
========================================================== */

export async function reloadProductCache() {

    await refreshProducts();

}

/* ==========================================================
   Product Exists
========================================================== */

export function productExists(productId) {

    return productCache.some(product =>
        String(product.id) === String(productId)
    );

}

/* ==========================================================
   Find Product By ID
========================================================== */

export function findProduct(productId) {

    return productCache.find(product =>
        String(product.id) === String(productId)
    ) ?? null;

}

/* ==========================================================
   Find Product By Barcode
========================================================== */

export function findCachedBarcode(barcode) {

    return productCache.find(product =>
        String(product.barcode) === String(barcode)
    ) ?? null;

}

/* ==========================================================
   Product Count
========================================================== */

export function getProductCount() {

    return productCache.length;

}

/* ==========================================================
   Is Modal Open
========================================================== */

export function isProductSearchOpen() {

    const element = qs("#productModal");

    return element?.classList.contains("show") ?? false;

}

/* ==========================================================
   Destroy Module
========================================================== */

export function destroyProductSearch() {

    productCache = [];

    filteredProducts = [];

    selectedRow = null;

    highlightedIndex = 0;

    initialized = false;

}

/* ==========================================================
   Public API
========================================================== */

export default {

    initializeProductSearch,

    openProductSearch,

    closeProductSearch,

    refreshProducts,

    reloadProductCache,

    resetProductSearch,

    selectProduct,

    searchBarcode,

    fillProductFromBarcode,

    getFilteredProducts,

    getProductCache,

    getProductCount,

    productExists,

    findProduct,

    findCachedBarcode,

    clearSearchBox,

    focusSearchBox,

    isProductSearchOpen,

    destroyProductSearch

};

