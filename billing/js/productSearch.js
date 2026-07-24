import { supabase } from "../supabase.js";
import { state } from "./state.js";
import { qs, qsa } from "./utils.js";
import { recalculateRow } from "./calculations.js";
import { showError } from "./notifications.js";

let productCache = [];
let filteredProducts = [];
let selectedRow = null;
let highlightedIndex = 0;

/* ============================================================
   Initialize
============================================================ */

export async function initializeProductSearch() {

    await loadProducts();

    registerEvents();

}

/* ============================================================
   Load Products
============================================================ */

async function loadProducts() {

    try {

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("name");

        if (error) throw error;

        productCache = data || [];

    }

    catch (error) {

        console.error(error);

        showError("Unable to load products.");

    }

}

/* ============================================================
   Register Events
============================================================ */

function registerEvents() {

    const searchInput = qs("#productSearchInput");

    if (searchInput) {

        searchInput.addEventListener("input", (event) => {

            filterProducts(event.target.value);

        });

    }

    const closeButton = qs("#btnCloseProductSearch");

    if (closeButton) {

        closeButton.addEventListener("click", closeProductSearch);

    }

}

/* ============================================================
   Open Product Search
============================================================ */

export function openProductSearch(row) {

    selectedRow = row;

    highlightedIndex = 0;

    filteredProducts = [...productCache];

    renderProductList();

    const modalElement = qs("#productSearchModal");

    if (!modalElement)
        return;

    const modal =
        bootstrap.Modal.getOrCreateInstance(modalElement);

    modal.show();

    const searchInput = qs("#productSearchInput");

    if (searchInput) {

        searchInput.value = "";

        setTimeout(() => searchInput.focus(), 200);

    }

}

/* ============================================================
   Close Product Search
============================================================ */

export function closeProductSearch() {

    const modalElement = qs("#productSearchModal");

    if (!modalElement)
        return;

    bootstrap.Modal
        .getOrCreateInstance(modalElement)
        .hide();

}

/* ============================================================
   Filter Products
============================================================ */

function filterProducts(keyword) {

    keyword = keyword
        .trim()
        .toLowerCase();

    if (!keyword.length) {

        filteredProducts = [...productCache];

        highlightedIndex = 0;

        renderProductList();

        return;

    }

    filteredProducts = productCache.filter(product => {

        return (

            (product.name || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (product.product_code || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (product.barcode || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (product.hsn_code || "")
                .toLowerCase()
                .includes(keyword)

        );

    });

    highlightedIndex = 0;

    renderProductList();

}

/* ============================================================
   Render Product List
============================================================ */

function renderProductList() {

    const tbody = qs("#productSearchResults");

    if (!tbody)
        return;

    tbody.innerHTML = "";

    if (!filteredProducts.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-muted py-4">

                    No products found

                </td>

            </tr>

        `;

        return;

    }

    filteredProducts.forEach((product, index) => {

        const row = document.createElement("tr");

        if (index === highlightedIndex)
            row.classList.add("table-primary");

        row.dataset.index = index;

        row.innerHTML = `

            <td>${product.product_code ?? ""}</td>

            <td>${product.name ?? ""}</td>

            <td>${product.batch ?? ""}</td>

            <td>${product.stock ?? 0}</td>

            <td>${product.rate ?? 0}</td>

            <td>${product.gst ?? 0}%</td>

            <td>

                <button
                    class="btn btn-success btn-sm select-product">

                    Select

                </button>

            </td>

        `;

        tbody.appendChild(row);

    });

}

/* ============================================================
   Product Selection Events
============================================================ */

document.addEventListener("click", (event) => {

    const button = event.target.closest(".select-product");

    if (!button) return;

    const row = button.closest("tr");

    if (!row) return;

    const index = Number(row.dataset.index);

    selectProduct(index);

});

document.addEventListener("dblclick", (event) => {

    const row = event.target.closest("#productSearchResults tr");

    if (!row) return;

    selectProduct(Number(row.dataset.index));

});

/* ============================================================
   Select Product
============================================================ */

function selectProduct(index) {

    const product = filteredProducts[index];

    if (!product || !selectedRow)
        return;

    fillInvoiceRow(product);

    closeProductSearch();

}

/* ============================================================
   Fill Invoice Row
============================================================ */

function fillInvoiceRow(product) {

    selectedRow.querySelector(".product-id").value =
        product.id ?? "";

    selectedRow.querySelector(".product-name").value =
        product.name ?? "";

    selectedRow.querySelector(".batch").value =
        product.batch ?? "";

    selectedRow.querySelector(".expiry").value =
        product.expiry ?? "";

    selectedRow.querySelector(".hsn").value =
        product.hsn_code ?? "";

    selectedRow.querySelector(".quantity").value = 1;

    selectedRow.querySelector(".free").value = 0;

    selectedRow.querySelector(".rate").value =
        Number(product.rate ?? 0);

    selectedRow.querySelector(".discount").value =
        Number(product.discount ?? 0);

    selectedRow.querySelector(".gst").value =
        Number(product.gst ?? 0);

    recalculateRow(selectedRow);

    const qty = selectedRow.querySelector(".quantity");

    if (qty) {

        qty.focus();

        qty.select();

    }

}

/* ============================================================
   Keyboard Navigation
============================================================ */

document.addEventListener("keydown", (event) => {

    const modal = qs("#productSearchModal");

    if (!modal || !modal.classList.contains("show"))
        return;

    switch (event.key) {

        case "ArrowDown":

            event.preventDefault();

            if (highlightedIndex < filteredProducts.length - 1)
                highlightedIndex++;

            renderProductList();

            break;

        case "ArrowUp":

            event.preventDefault();

            if (highlightedIndex > 0)
                highlightedIndex--;

            renderProductList();

            break;

        case "Enter":

            event.preventDefault();

            if (filteredProducts.length)
                selectProduct(highlightedIndex);

            break;

        case "Escape":

            event.preventDefault();

            closeProductSearch();

            break;

    }

});

/* ============================================================
   Public Helpers
============================================================ */

export function refreshProducts() {

    return loadProducts();

}

export function getProductById(id) {

    return productCache.find(product => product.id === id);

}

export function getAllProducts() {

    return [...productCache];

}
