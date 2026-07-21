import { supabase } from "./supabase.js";

/* ======================================================
   PRODUCTS MODULE
   PART 1 OF 4
   ====================================================== */

let products = [];
let editingId = null;

/* -------------------------
   DOM ELEMENTS
------------------------- */

const productTable = document.getElementById("productTable");
const productForm = document.getElementById("productForm");
const productModal = document.getElementById("productModal");
const modalTitle = document.getElementById("modalTitle");

const addProductBtn = document.getElementById("addProductBtn");
const closeModal = document.getElementById("closeModal");
const saveProductBtn = document.getElementById("saveProductBtn");

const searchProduct = document.getElementById("searchProduct");

const productName = document.getElementById("productName");
const packSize = document.getElementById("packSize");
const manufacturer = document.getElementById("manufacturer");
const category = document.getElementById("category");
const hsn = document.getElementById("hsn");

const purchaseRate = document.getElementById("purchaseRate");
const sellingRate = document.getElementById("sellingRate");
const mrp = document.getElementById("mrp");
const gst = document.getElementById("gst");

const quantity = document.getElementById("quantity");
const unit = document.getElementById("unit");

const batch = document.getElementById("batch");
const lot = document.getElementById("lot");
const expiry = document.getElementById("expiry");

/* -------------------------
   PAGE LOAD
------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    loadProducts();

});

/* -------------------------
   LOAD PRODUCTS
------------------------- */

async function loadProducts() {

    productTable.innerHTML = `
        <tr>
            <td colspan="13" style="text-align:center;">
                Loading Products...
            </td>
        </tr>
    `;

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("product", { ascending: true });

    if (error) {

        console.error(error);

        productTable.innerHTML = `
            <tr>
                <td colspan="13" style="text-align:center;color:red;">
                    Error Loading Products
                </td>
            </tr>
        `;

        return;
    }

    products = data || [];

    renderProducts(products);

}

/* -------------------------
   RENDER TABLE
------------------------- */

/* -------------------------
   RENDER PRODUCTS
------------------------- */

function renderProducts(list) {

    if (!list || list.length === 0) {

        productTable.innerHTML = `
        <tr>
            <td colspan="13" style="text-align:center;">
                No Products Found
            </td>
        </tr>
        `;

        return;
    }

    let html = "";

    list.forEach(item => {

        html += `
        <tr>

            <td>${item.product ?? ""}</td>
<td>${item.pack_size ?? ""}</td>
<td>${item.manufacturer ?? ""}</td>
            <td>${item.category ?? ""}</td>

            <td>${formatNumber(item.mrp)}</td>
            <td>${formatNumber(item.selling_rate)}</td>
            <td>${formatNumber(item.purchase_rate)}</td>

            <td>${item.gst ?? ""}</td>
            <td>${formatNumber(item.quantity)}</td>

            <td>${item.unit ?? ""}</td>
            <td>${item.batch ?? ""}</td>
            <td>${item.lot ?? ""}</td>

            <td>${formatDate(item.expiry)}</td>

            <td>
                <button class="edit-btn" data-id="${item.id}">
                    Edit
                </button>

                <button class="delete-btn" data-id="${item.id}">
                    Delete
                </button>
            </td>

        </tr>
        `;

    });

    productTable.innerHTML = html;

}
/* -------------------------
   SEARCH
------------------------- */

searchProduct.addEventListener("keyup", () => {

    const keyword = searchProduct.value
        .trim()
        .toLowerCase();

    if (keyword === "") {

        renderProducts(products);
        return;

    }

    const filtered = products.filter(item =>

        (item.product || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (item.manufacturer || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (item.category || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (item.batch || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (item.lot || "")
            .toLowerCase()
            .includes(keyword)

    );

    renderProducts(filtered);

});

/* ======================================================
   PART 2 OF 4
   MODAL + ADD + EDIT + SAVE
====================================================== */

/* -------------------------
   OPEN ADD PRODUCT
------------------------- */

addProductBtn.addEventListener("click", () => {

    editingId = null;

    modalTitle.textContent = "Add Product";

    clearForm();

    productModal.style.display = "flex";

});

/* -------------------------
   CLOSE MODAL
------------------------- */

closeModal.addEventListener("click", () => {

    productModal.style.display = "none";

});

window.addEventListener("click", (e) => {

    if (e.target === productModal) {

        productModal.style.display = "none";

    }

});

/* -------------------------
   CLEAR FORM
------------------------- */

function clearForm() {

    productForm.reset();

    productName.focus();

}

/* -------------------------
   SAVE PRODUCT
------------------------- */

saveProductBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    if (productName.value.trim() === "") {

        alert("Please enter Product Name");
        productName.focus();
        return;

    }

    const productData = {

        product: productName.value.trim(),

       pack_size: packSize.value.trim(),

        manufacturer: manufacturer.value.trim(),

        category: category.value.trim(),

        hsn: hsn.value.trim(),

        purchase_rate: Number(purchaseRate.value) || 0,

        selling_rate: Number(sellingRate.value) || 0,

        mrp: Number(mrp.value) || 0,

        gst: Number(gst.value) || 0,

        quantity: Number(quantity.value) || 0,

        unit: unit.value.trim(),

        batch: batch.value.trim(),

        lot: lot.value.trim(),

        expiry: expiry.value || null

    };

    let error;

    if (editingId === null) {

        ({ error } = await supabase
            .from("products")
            .insert([productData]));

    } else {

        ({ error } = await supabase
            .from("products")
            .update(productData)
            .eq("id", editingId));

    }

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    productModal.style.display = "none";

    clearForm();

    loadProducts();

});

/* -------------------------
   EDIT PRODUCT
------------------------- */

productTable.addEventListener("click", async (e) => {

    const editButton = e.target.closest(".edit-btn");

    if (!editButton) return;

    editingId = editButton.dataset.id;

    const product = products.find(item => item.id == editingId);

    if (!product) return;

    modalTitle.textContent = "Edit Product";

    productName.value = product.product || "";

   packSize.value = product.pack_size || "";

    manufacturer.value = product.manufacturer || "";

    category.value = product.category || "";

    hsn.value = product.hsn || "";

    purchaseRate.value = product.purchase_rate || "";

    sellingRate.value = product.selling_rate || "";

    mrp.value = product.mrp || "";

    gst.value = product.gst || "";

    quantity.value = product.quantity || "";

    unit.value = product.unit || "";

    batch.value = product.batch || "";

    lot.value = product.lot || "";

    expiry.value = product.expiry || "";

    productModal.style.display = "flex";

});

/* ======================================================
   PART 3 OF 4
   DELETE + KEYBOARD SHORTCUTS + UTILITIES
====================================================== */

/* -------------------------
   DELETE PRODUCT
------------------------- */

productTable.addEventListener("click", async (e) => {

    const deleteButton = e.target.closest(".delete-btn");

    if (!deleteButton) return;

    const id = deleteButton.dataset.id;

    const confirmDelete = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    await loadProducts();

});

/* -------------------------
   ESC KEY CLOSE MODAL
------------------------- */

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        productModal.style.display = "none";

    }

});

/* -------------------------
   ENTER KEY SAVE
------------------------- */

productForm.addEventListener("keydown", (e) => {

    if (e.key !== "Enter") return;

    if (e.target.tagName === "TEXTAREA") return;

    e.preventDefault();

    saveProductBtn.click();

});

/* -------------------------
   REFRESH TABLE
------------------------- */

async function refreshProducts() {

    await loadProducts();

}

/* -------------------------
   RESET SEARCH
------------------------- */

function resetSearch() {

    searchProduct.value = "";

    renderProducts(products);

}

/* -------------------------
   FORMAT NUMBER
------------------------- */

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "";

    }

    return Number(value).toLocaleString();

}

/* -------------------------
   FORMAT DATE
------------------------- */

function formatDate(value) {

    if (!value) return "";

    const d = new Date(value);

    if (isNaN(d.getTime())) {

        return value;

    }

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;

}

/* -------------------------
   WINDOW FOCUS
------------------------- */

window.addEventListener("focus", () => {

    refreshProducts();

});

/* -------------------------
   PAGE VISIBILITY
------------------------- */

document.addEventListener("visibilitychange", () => {

    if (!document.hidden) {

        refreshProducts();

    }

});

/* ======================================================
   PART 4 OF 4
   FINAL INITIALIZATION
====================================================== */

/* -------------------------
   PREVENT DOUBLE SAVE
------------------------- */

let savingProduct = false;

/* Override save button to prevent double click */

saveProductBtn.addEventListener("click", async () => {

    if (savingProduct) return;

    savingProduct = true;

    saveProductBtn.disabled = true;

    setTimeout(() => {

        savingProduct = false;

        saveProductBtn.disabled = false;

    }, 800);

});

/* -------------------------
   AUTO CLOSE AFTER SAVE
------------------------- */

async function reloadProducts() {

    await loadProducts();

    productModal.style.display = "none";

    editingId = null;

}

/* -------------------------
   CLEAR FORM WHEN MODAL CLOSES
------------------------- */

function closeProductModal() {

    productModal.style.display = "none";

    clearForm();

    editingId = null;

}

closeModal.addEventListener("click", closeProductModal);

window.addEventListener("click", function (e) {

    if (e.target === productModal) {

        closeProductModal();

    }

});

/* -------------------------
   SORT PRODUCTS
------------------------- */

function sortProductsAZ() {

    products.sort((a, b) =>

        (a.product || "").localeCompare(b.product || "")

    );

    renderProducts(products);

}

/* -------------------------
   PRODUCT COUNT
------------------------- */

function getProductCount() {

    return products.length;

}

/* -------------------------
   REFRESH AFTER OPERATIONS
------------------------- */

async function refreshModule() {

    await loadProducts();

    sortProductsAZ();

}

/* -------------------------
   START MODULE
------------------------- */

(async function () {

    await refreshModule();

    console.log(
        "Products Module Loaded Successfully"
    );

})();
