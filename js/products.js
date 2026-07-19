/*********************************************************************
 * Genius Scientific ERP
 * products.js
 * PART 1 OF 4
 *********************************************************************/

import { supabase } from "./supabase.js";

/*********************************************************************
 * DOM REFERENCES
 *********************************************************************/

const productTable = document.getElementById("productTable");
const productForm = document.getElementById("productForm");

const productModal = document.getElementById("productModal");
const modalTitle = document.getElementById("modalTitle");

const addProductBtn = document.getElementById("addProductBtn");
const closeModalBtn = document.getElementById("closeModal");

const searchInput = document.getElementById("searchProduct");

const saveProductBtn = document.getElementById("saveProductBtn");

const txtProduct = document.getElementById("productName");
const txtManufacturer = document.getElementById("manufacturer");
const txtCategory = document.getElementById("category");
const txtHSN = document.getElementById("hsn");

const txtPurchaseRate = document.getElementById("purchaseRate");
const txtSellingRate = document.getElementById("sellingRate");
const txtMRP = document.getElementById("mrp");
const txtGST = document.getElementById("gst");

const txtQuantity = document.getElementById("quantity");
const txtUnit = document.getElementById("unit");
const txtBatch = document.getElementById("batch");
const txtLot = document.getElementById("lot");
const txtExpiry = document.getElementById("expiry");

/*********************************************************************
 * GLOBAL VARIABLES
 *********************************************************************/

let products = [];
let editingProductId = null;

/*********************************************************************
 * INITIALIZATION
 *********************************************************************/

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {

    registerEvents();

    await loadProducts();

}

/*********************************************************************
 * EVENTS
 *********************************************************************/

function registerEvents() {

    addProductBtn.addEventListener("click", openAddModal);

    closeModalBtn.addEventListener("click", closeModal);

    window.addEventListener("click", outsideModalClose);

    searchInput.addEventListener("input", filterProducts);

}

/*********************************************************************
 * LOAD PRODUCTS
 *********************************************************************/

async function loadProducts() {

    try {

        showLoading();

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("product", { ascending: true });

        if (error) throw error;

        products = data || [];

        renderProducts(products);

    }
    catch (err) {

        console.error(err);

        showError(err.message);

    }

}

/*********************************************************************
 * RENDER TABLE
 *********************************************************************/

function renderProducts(list) {

    productTable.innerHTML = "";

    if (list.length === 0) {

        productTable.innerHTML = `
        <tr>
            <td colspan="13" style="text-align:center;">
                No Products Found
            </td>
        </tr>`;

        return;

    }

    list.forEach(product => {

        productTable.insertAdjacentHTML("beforeend", `

<tr>

<td>${product.product ?? ""}</td>

<td>${product.manufacturer ?? ""}</td>

<td>${product.category ?? ""}</td>

<td>${product.mrp ?? ""}</td>

<td>${product.selling_rate ?? ""}</td>

<td>${product.purchase_rate ?? ""}</td>

<td>${product.gst ?? ""}</td>

<td>${product.quantity ?? ""}</td>

<td>${product.unit ?? ""}</td>

<td>${product.batch ?? ""}</td>

<td>${product.lot ?? ""}</td>

<td>${formatDate(product.expiry)}</td>

<td>

<button onclick="editProduct(${product.id})">
Edit
</button>

<button onclick="deleteProduct(${product.id})">
Delete
</button>

</td>

</tr>

`);

    });

}

/*********************************************************************
 * SEARCH
 *********************************************************************/

function filterProducts() {

    const keyword = searchInput.value.trim().toLowerCase();

    if (keyword === "") {

        renderProducts(products);

        return;

    }

    const filtered = products.filter(item =>

        (item.product || "").toLowerCase().includes(keyword) ||

        (item.manufacturer || "").toLowerCase().includes(keyword) ||

        (item.category || "").toLowerCase().includes(keyword)

    );

    renderProducts(filtered);

}

/*********************************************************************
 * MODAL
 *********************************************************************/

function openAddModal() {

    editingProductId = null;

    modalTitle.textContent = "Add Product";

    productForm.reset();

    productModal.style.display = "flex";

}

function closeModal() {

    productModal.style.display = "none";

}

function outsideModalClose(event) {

    if (event.target === productModal) {

        closeModal();

    }

}

/*********************************************************************
 * HELPERS
 *********************************************************************/

function showLoading() {

    productTable.innerHTML = `
    <tr>
        <td colspan="13" style="text-align:center;">
            Loading Products...
        </td>
    </tr>`;

}

function showError(message) {

    productTable.innerHTML = `
    <tr>
        <td colspan="13" style="text-align:center;color:red;">
            ${message}
        </td>
    </tr>`;

}

function formatDate(value) {

    if (!value) return "";

    return value;

}

/*********************************************************************
 * END OF PART 1
 *********************************************************************/

