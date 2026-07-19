import { supabase } from "./supabase.js";

/* =========================================================
   PURCHASE ENTRY
========================================================= */

// -----------------------------
// DOM Elements
// -----------------------------

const supplier = document.getElementById("supplier");
const supplierInvoiceNo = document.getElementById("supplierInvoiceNo");
const purchaseDate = document.getElementById("purchaseDate");
const status = document.getElementById("status");
const attachment = document.getElementById("attachment");
const remarks = document.getElementById("remarks");

const productBody = document.getElementById("productBody");

const subtotal = document.getElementById("subtotal");
const gstTotal = document.getElementById("gstTotal");
const grandTotal = document.getElementById("grandTotal");

const addRowBtn = document.getElementById("addRowBtn");
const savePurchaseBtn = document.getElementById("savePurchaseBtn");
const cancelBtn = document.getElementById("cancelBtn");

// -----------------------------
// Global Variables
// -----------------------------

let suppliers = [];
let products = [];

let purchaseId = null;
let editMode = false;

// -----------------------------
// Page Load
// -----------------------------

document.addEventListener("DOMContentLoaded", async () => {

    setToday();

    await loadSuppliers();

    await loadProducts();

    addProductRow();

    checkEditMode();

});

// =========================================================
// TODAY'S DATE
// =========================================================

function setToday() {

    if (purchaseDate.value) return;

    const today = new Date();

    purchaseDate.value =
        today.toISOString().split("T")[0];

}

// =========================================================
// LOAD SUPPLIERS
// =========================================================

async function loadSuppliers() {

    const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");

    if (error) {

        console.error(error);

        return;

    }

    suppliers = data || [];

    supplier.innerHTML =
        `<option value="">Select Supplier</option>`;

    suppliers.forEach(item => {

        supplier.innerHTML += `

<option value="${item.id}">
${item.name}
</option>

`;

    });

}

// =========================================================
// LOAD PRODUCTS
// =========================================================

async function loadProducts() {

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("product");

    if (error) {

        console.error(error);

        return;

    }

    products = data || [];

}

// =========================================================
// PRODUCT OPTIONS
// =========================================================

function getProductOptions(selected = "") {

    let html =
        `<option value="">Select Product</option>`;

    products.forEach(product => {

        html += `

<option
value="${product.id}"
${selected == product.id ? "selected" : ""}>

${product.product}

</option>

`;

    });

    return html;

}

// =========================================================
// FORMAT NUMBER
// =========================================================

function money(value) {

    return Number(value || 0).toFixed(2);

}

// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(date) {

    if (!date) return "";

    return new Date(date)
        .toISOString()
        .split("T")[0];

}

// =========================================================
// CANCEL
// =========================================================

cancelBtn.addEventListener("click", () => {

    window.location.href = "purchase.html";

});

// =========================================================
// EDIT MODE
// =========================================================

function checkEditMode() {

    const params =
        new URLSearchParams(window.location.search);

    if (!params.has("id"))
        return;

    purchaseId = Number(params.get("id"));

    editMode = true;

    loadPurchase(purchaseId);

}

/* =========================================================
   ADD PRODUCT ROW
========================================================= */

addRowBtn.addEventListener("click", () => {

    addProductRow();

});

function addProductRow(item = {}) {

    const row = document.createElement("tr");

    row.innerHTML = `

<td>

<select class="product">

${getProductOptions(item.product_id || "")}

</select>

</td>

<td>

<input
type="text"
class="batch"
value="${item.batch || ""}">

</td>

<td>

<input
type="date"
class="expiry"
value="${formatDate(item.expiry)}">

</td>

<td>

<input
type="number"
class="qty"
min="0"
step="0.01"
value="${item.qty || 1}">

</td>

<td>

<input
type="number"
class="rate"
min="0"
step="0.01"
value="${item.purchase_rate || 0}">

</td>

<td>

<input
type="number"
class="gst"
min="0"
step="0.01"
value="${item.gst || 0}">

</td>

<td>

<input
type="number"
class="amount"
readonly
value="${item.amount || 0}">

</td>

<td style="text-align:center">

<button
type="button"
class="removeRow danger-btn">

<i class="fa-solid fa-trash"></i>

</button>

</td>

`;

    productBody.appendChild(row);

    bindRowEvents(row);

    calculateRow(row);

}

/* =========================================================
   BIND ROW EVENTS
========================================================= */

function bindRowEvents(row) {

    const product = row.querySelector(".product");

    const qty = row.querySelector(".qty");

    const rate = row.querySelector(".rate");

    const gst = row.querySelector(".gst");

    const remove = row.querySelector(".removeRow");

    product.addEventListener("change", () => {

        productChanged(row);

    });

    qty.addEventListener("input", () => {

        calculateRow(row);

    });

    rate.addEventListener("input", () => {

        calculateRow(row);

    });

    gst.addEventListener("input", () => {

        calculateRow(row);

    });

    remove.addEventListener("click", () => {

        removeRow(row);

    });

}

/* =========================================================
   PRODUCT SELECTED
========================================================= */

function productChanged(row) {

    const productSelect =
        row.querySelector(".product");

    const rate =
        row.querySelector(".rate");

    const gst =
        row.querySelector(".gst");

    const selected =
        products.find(p =>
            Number(p.id) ===
            Number(productSelect.value));

    if (!selected)
        return;

    rate.value =
        selected.purchase_rate || 0;

    gst.value =
        selected.gst || 0;

    calculateRow(row);

}

/* =========================================================
   CALCULATE ROW
========================================================= */

function calculateRow(row) {

    const qty =
        Number(
            row.querySelector(".qty").value
        );

    const rate =
        Number(
            row.querySelector(".rate").value
        );

    const amount =
        row.querySelector(".amount");

    amount.value =
        (qty * rate).toFixed(2);

    calculateTotals();

}

/* =========================================================
   TOTALS
========================================================= */

function calculateTotals() {

    let sub = 0;

    let gstValue = 0;

    document
        .querySelectorAll("#productBody tr")
        .forEach(row => {

            const amount =
                Number(
                    row.querySelector(".amount").value
                );

            const gst =
                Number(
                    row.querySelector(".gst").value
                );

            sub += amount;

            gstValue +=
                amount * gst / 100;

        });

    subtotal.textContent =
        "₹" + money(sub);

    gstTotal.textContent =
        "₹" + money(gstValue);

    grandTotal.textContent =
        "₹" + money(sub + gstValue);

}

/* =========================================================
   REMOVE ROW
========================================================= */

function removeRow(row) {

    if (
        productBody.querySelectorAll("tr")
        .length === 1
    ) {

        alert(
            "At least one product is required."
        );

        return;

    }

    row.remove();

    calculateTotals();

}

/* =========================================================
   SAVE PURCHASE
========================================================= */

savePurchaseBtn.addEventListener("click", async () => {

    await savePurchase();

});

async function savePurchase() {

    if (!validateForm()) return;

    savePurchaseBtn.disabled = true;
    savePurchaseBtn.innerHTML = "Saving...";

    try {

        if (editMode) {

            await reverseOldStock();

            await deleteOldItems();

            await updatePurchaseMaster();

        } else {

            purchaseId = await insertPurchaseMaster();

        }

        await savePurchaseItems();

        alert("Purchase saved successfully.");

        window.location.href = "purchase.html";

    }
    catch (err) {

        console.error(err);

        alert(err.message);

    }
    finally {

        savePurchaseBtn.disabled = false;
        savePurchaseBtn.innerHTML = "Save Purchase";

    }

}

/* =========================================================
   VALIDATION
========================================================= */

function validateForm() {

    if (!supplier.value) {

        alert("Select supplier.");

        supplier.focus();

        return false;

    }

    if (!supplierInvoiceNo.value.trim()) {

        alert("Enter supplier invoice number.");

        supplierInvoiceNo.focus();

        return false;

    }

    const rows =
        productBody.querySelectorAll("tr");

    if (rows.length === 0) {

        alert("Add at least one product.");

        return false;

    }

    for (const row of rows) {

        const product =
            row.querySelector(".product").value;

        const qty =
            Number(row.querySelector(".qty").value);

        const rate =
            Number(row.querySelector(".rate").value);

        if (!product) {

            alert("Select product.");

            return false;

        }

        if (qty <= 0) {

            alert("Quantity must be greater than zero.");

            return false;

        }

        if (rate <= 0) {

            alert("Purchase rate must be greater than zero.");

            return false;

        }

    }

    return true;

}

/* =========================================================
   INSERT PURCHASE MASTER
========================================================= */

async function insertPurchaseMaster() {

    const { data, error } =
        await supabase
            .from("purchase_master")
            .insert({

                supplier_invoice_no:
                    supplierInvoiceNo.value,

                supplier_id:
                    supplier.value,

                purchase_date:
                    purchaseDate.value,

                subtotal:
                    Number(subtotal.textContent.replace(/[₹,]/g, "")),

                gst_total:
                    Number(gstTotal.textContent.replace(/[₹,]/g, "")),

                grand_total:
                    Number(grandTotal.textContent.replace(/[₹,]/g, "")),

                remarks:
                    remarks.value,

                status:
                    status.value,

                attachment_url: await uploadAttachment()

            })
            .select()
            .single();

    if (error)
        throw error;

    return data.id;

}

/* =========================================================
   UPDATE PURCHASE MASTER
========================================================= */

async function updatePurchaseMaster() {

    const { error } =
        await supabase
            .from("purchase_master")
            .update({

                supplier_invoice_no:
                    supplierInvoiceNo.value,

                supplier_id:
                    supplier.value,

                purchase_date:
                    purchaseDate.value,

                subtotal:
                    Number(subtotal.textContent.replace(/[₹,]/g, "")),

                gst_total:
                    Number(gstTotal.textContent.replace(/[₹,]/g, "")),

                grand_total:
                    Number(grandTotal.textContent.replace(/[₹,]/g, "")),

                remarks:
                    remarks.value,

                status:
                    status.value

            })
            .eq("id", purchaseId);

    if (error)
        throw error;
attachment_url:
    attachment.files.length
        ? await uploadAttachment()
        : undefined

}

/* =========================================================
   SAVE ITEMS
========================================================= */

async function savePurchaseItems() {

    const rows =
        productBody.querySelectorAll("tr");

    for (const row of rows) {

        const item = {

            purchase_id: purchaseId,

            product_id:
                Number(
                    row.querySelector(".product").value
                ),

            batch:
                row.querySelector(".batch").value,

            expiry:
                row.querySelector(".expiry").value,

            qty:
                Number(
                    row.querySelector(".qty").value
                ),

            purchase_rate:
                Number(
                    row.querySelector(".rate").value
                ),

            gst:
                Number(
                    row.querySelector(".gst").value
                ),

            amount:
                Number(
                    row.querySelector(".amount").value
                )

        };

        const { error } =
            await supabase
                .from("purchase_items")
                .insert(item);

        if (error)
            throw error;

        await increaseStock(
            item.product_id,
            item.qty
        );

    }

}

/* =========================================================
   STOCK UPDATE
========================================================= */

async function increaseStock(productId, qty) {

    const { data, error } =
        await supabase
            .from("products")
            .select("quantity")
            .eq("id", productId)
            .single();

    if (error)
        throw error;

    const currentQty =
        Number(data.quantity || 0);

    const { error: updateError } =
        await supabase
            .from("products")
            .update({

                quantity:
                    currentQty + qty

            })
            .eq("id", productId);

    if (updateError)
        throw updateError;

}

/* =========================================================
   LOAD PURCHASE
========================================================= */

async function loadPurchase(id) {

    const { data: master, error } = await supabase
        .from("purchase_master")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error(error);
        alert("Unable to load purchase.");
        return;
    }

    supplier.value = master.supplier_id;
    supplierInvoiceNo.value = master.supplier_invoice_no;
    purchaseDate.value = formatDate(master.purchase_date);
    remarks.value = master.remarks || "";
    status.value = master.status || "Saved";

    productBody.innerHTML = "";

    const { data: items } = await supabase
        .from("purchase_items")
        .select("*")
        .eq("purchase_id", id);

    items.forEach(item => {

        addProductRow(item);

    });

    calculateTotals();

}

/* =========================================================
   REVERSE OLD STOCK
========================================================= */

async function reverseOldStock() {

    const { data: items } = await supabase
        .from("purchase_items")
        .select("*")
        .eq("purchase_id", purchaseId);

    for (const item of items || []) {

        const { data: product } = await supabase
            .from("products")
            .select("quantity")
            .eq("id", item.product_id)
            .single();

        const currentQty =
            Number(product.quantity || 0);

        await supabase
            .from("products")
            .update({

                quantity: Math.max(
                    0,
                    currentQty - Number(item.qty)
                )

            })
            .eq("id", item.product_id);

    }

}

/* =========================================================
   DELETE OLD ITEMS
========================================================= */

async function deleteOldItems() {

    const { error } =
        await supabase
            .from("purchase_items")
            .delete()
            .eq("purchase_id", purchaseId);

    if (error)
        throw error;

}

/* =========================================================
   UPLOAD ATTACHMENT
========================================================= */

async function uploadAttachment() {

    if (!attachment.files.length)
        return null;

    const file = attachment.files[0];

    const fileName =
        Date.now() + "_" + file.name;

    const { error } =
        await supabase.storage
            .from("purchase-attachments")
            .upload(fileName, file);

    if (error)
        throw error;

    const { data } =
        supabase.storage
            .from("purchase-attachments")
            .getPublicUrl(fileName);

    return data.publicUrl;

}

