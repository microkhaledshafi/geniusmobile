// ==========================================
// Genius Scientific ERP
// Products Module
// Part 1
// ==========================================

import { supabase } from "./supabase.js";

// ==========================================
// Database
// ==========================================

const TABLE_NAME = "products";

// ==========================================
// DOM Elements
// ==========================================

const productTable = document.getElementById("productTable");

const productForm = document.getElementById("productForm");

const productModal = document.getElementById("productModal");

const modalTitle = document.getElementById("modalTitle");

const addProductBtn = document.getElementById("addProductBtn");

const closeModal = document.getElementById("closeModal");

const closeModalBtn = document.getElementById("closeModalBtn");

const searchProduct = document.getElementById("searchProduct");

// ==========================================
// Form Fields
// ==========================================

const productId = document.getElementById("productId");

const productName = document.getElementById("productName");

const packSize = document.getElementById("packSize");

const manufacturer = document.getElementById("manufacturer");

const category = document.getElementById("category");

const hsn = document.getElementById("hsn");

const gst = document.getElementById("gst");

const purchaseRate = document.getElementById("purchaseRate");

const sellingRate = document.getElementById("sellingRate");

const mrp = document.getElementById("mrp");

const quantity = document.getElementById("quantity");

const unit = document.getElementById("unit");

const batch = document.getElementById("batch");

const lot = document.getElementById("lot");

const expiry = document.getElementById("expiry");

// ==========================================
// Variables
// ==========================================

let products = [];

let editMode = false;

// ==========================================
// Utility Functions
// ==========================================

function showLoading() {

    const loader = document.getElementById("loadingOverlay");

    if (loader) {
        loader.style.display = "flex";
    }

}

function hideLoading() {

    const loader = document.getElementById("loadingOverlay");

    if (loader) {
        loader.style.display = "none";
    }

}

// ==========================================
// Toast Notification
// ==========================================

function showToast(message, type = "success") {

    const container = document.getElementById("toastContainer");

    if (!container) return;

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}

// ==========================================
// Modal Functions
// ==========================================

function openModal(edit = false) {

    editMode = edit;

    modalTitle.textContent = edit
        ? "Edit Product"
        : "Add Product";

    productModal.style.display = "block";

}

function closeProductModal() {

    productModal.style.display = "none";

    clearForm();

}

// ==========================================
// Clear Form
// ==========================================

function clearForm() {

    productId.value = "";

    productName.value = "";

    packSize.value = "";

    manufacturer.value = "";

    category.value = "";

    hsn.value = "";

    gst.value = "";

    purchaseRate.value = "";

    sellingRate.value = "";

    mrp.value = "";

    quantity.value = "";

    unit.value = "";

    batch.value = "";

    lot.value = "";

    expiry.value = "";

    editMode = false;

}

// ==========================================
// Event Listeners
// ==========================================

addProductBtn.addEventListener("click", () => {

    clearForm();

    openModal(false);

});

closeModal.addEventListener("click", closeProductModal);

closeModalBtn.addEventListener("click", closeProductModal);

// Close when clicking outside modal

window.addEventListener("click", (e) => {

    if (e.target === productModal) {

        closeProductModal();

    }

});

// ==========================================
// Load Products
// ==========================================

async function loadProducts() {

    showLoading();

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .order("id", { ascending: false });

    hideLoading();

    if (error) {

        console.error(error);

        showToast(error.message, "error");

        return;

    }

    products = data || [];

    renderProducts(products);

}

// ==========================================
// Search Products
// ==========================================

searchProduct.addEventListener("input", function () {

    const keyword = this.value.toLowerCase().trim();

    const filtered = products.filter(item =>

        (item.product_name || "").toLowerCase().includes(keyword) ||

        (item.pack_size || "").toLowerCase().includes(keyword) ||

        (item.manufacturer || "").toLowerCase().includes(keyword) ||

        (item.category || "").toLowerCase().includes(keyword) ||

        (item.batch || "").toLowerCase().includes(keyword) ||

        (item.lot || "").toLowerCase().includes(keyword)

    );

    renderProducts(filtered);

});

// ==========================================
// Initial Load
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadProducts();

});

// ==========================================
// Save Product
// ==========================================

productForm.addEventListener("submit", saveProduct);

async function saveProduct(e) {

    e.preventDefault();

    showLoading();

    const productData = {

        product: productName.value.trim(),

        pack_size: packSize.value.trim(),

        manufacturer: manufacturer.value.trim(),

        category: category.value.trim(),

        hsn: hsn.value.trim(),

        gst: Number(gst.value) || 0,

        purchase_rate: Number(purchaseRate.value) || 0,

        selling_rate: Number(sellingRate.value) || 0,

        mrp: Number(mrp.value) || 0,

        quantity: Number(quantity.value) || 0,

        unit: unit.value.trim(),

        batch: batch.value.trim(),

        lot: lot.value.trim(),

        expiry: expiry.value || null,

        updated_at: new Date().toISOString()

    };

    let error;

    if (editMode) {

        ({ error } = await supabase

            .from(TABLE_NAME)

            .update(productData)

            .eq("id", productId.value));

    } else {

        ({ error } = await supabase

            .from(TABLE_NAME)

            .insert([productData]));

    }

    hideLoading();

    if (error) {

        console.error(error);

        showToast(error.message, "error");

        return;

    }

    showToast(

        editMode

            ? "Product updated successfully."

            : "Product added successfully."

    );

    closeProductModal();

    loadProducts();

}

// ==========================================
// Render Products
// ==========================================

function renderProducts(data) {

    productTable.innerHTML = "";

    if (!data.length) {

        productTable.innerHTML = `
            <tr>
                <td colspan="16" style="text-align:center;">
                    No Products Found
                </td>
            </tr>
        `;

        return;
    }

    data.forEach((item, index) => {

        productTable.innerHTML += `

        <tr>

            <td>${index + 1}</td>

            <td>${item.product ?? ""}</td>

            <td>${item.pack_size ?? ""}</td>

            <td>${item.manufacturer ?? ""}</td>

            <td>${item.category ?? ""}</td>

            <td>${item.hsn ?? ""}</td>

            <td>${item.gst ?? 0}%</td>

            <td>₹${Number(item.mrp).toFixed(2)}</td>

            <td>₹${Number(item.purchase_rate).toFixed(2)}</td>

            <td>₹${Number(item.selling_rate).toFixed(2)}</td>

            <td>${item.quantity ?? 0}</td>

            <td>${item.unit ?? ""}</td>

            <td>${item.batch ?? ""}</td>

            <td>${item.lot ?? ""}</td>

            <td>${item.expiry ?? ""}</td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editProduct(${item.id})">

                    Edit

                </button>

                <button
                    class="delete-btn"
                    onclick="deleteProduct(${item.id})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

// ==========================================
// Edit Product
// ==========================================

window.editProduct = function(id) {

    const item = products.find(p => p.id == id);

    if (!item) return;

    editMode = true;

    productId.value = item.id;

    productName.value = item.product ?? "";

    packSize.value = item.pack_size ?? "";

    manufacturer.value = item.manufacturer ?? "";

    category.value = item.category ?? "";

    hsn.value = item.hsn ?? "";

    gst.value = item.gst ?? "";

    purchaseRate.value = item.purchase_rate ?? "";

    sellingRate.value = item.selling_rate ?? "";

    mrp.value = item.mrp ?? "";

    quantity.value = item.quantity ?? "";

    unit.value = item.unit ?? "";

    batch.value = item.batch ?? "";

    lot.value = item.lot ?? "";

    expiry.value = item.expiry ?? "";

    openModal(true);

};

// ==========================================
// Delete Product
// ==========================================

window.deleteProduct = async function (id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    showLoading();

    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq("id", id);

    hideLoading();

    if (error) {

        console.error(error);

        showToast(error.message, "error");

        return;

    }

    showToast("Product deleted successfully.");

    loadProducts();

};

// ==========================================
// Keyboard Shortcuts
// ==========================================

document.addEventListener("keydown", (e) => {

    // ESC closes modal
    if (e.key === "Escape") {

        closeProductModal();

    }

    // Ctrl + N opens Add Product
    if (e.ctrlKey && e.key.toLowerCase() === "n") {

        e.preventDefault();

        clearForm();

        openModal(false);

    }

});

// ==========================================
// Initial Setup
// ==========================================

hideLoading();

loadProducts();

// ==========================================
// End of Products Module
// ==========================================
