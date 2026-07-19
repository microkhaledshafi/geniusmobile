import { supabase } from "./supabase.js";

/* =====================================================
   PURCHASE MODULE
   PART 1 - FOUNDATION
===================================================== */

let suppliers = [];
let products = [];

/* =====================================================
   DOM
===================================================== */

const supplierSelect = document.getElementById("supplierSelect");
const purchaseDate = document.getElementById("purchaseDate");
const purchaseTable = document.getElementById("purchaseTable");

const addRowBtn = document.getElementById("addRowBtn");

const subtotal = document.getElementById("subtotal");
const gstTotal = document.getElementById("gstTotal");
const grandTotal = document.getElementById("grandTotal");

/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    purchaseDate.value = new Date().toISOString().split("T")[0];

    await loadSuppliers();

    await loadProducts();

    addPurchaseRow();

});

/* =====================================================
   LOAD SUPPLIERS
===================================================== */

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

    supplierSelect.innerHTML = `
        <option value="">
            Select Supplier
        </option>
    `;

    suppliers.forEach(supplier => {

        supplierSelect.innerHTML += `

            <option value="${supplier.id}">

                ${supplier.name}

            </option>

        `;

    });

}

/* =====================================================
   LOAD PRODUCTS
===================================================== */

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

/* =====================================================
   ADD PURCHASE ROW
===================================================== */

addRowBtn.addEventListener("click", addPurchaseRow);

function addPurchaseRow() {

    let productOptions = `
        <option value="">
            Select Product
        </option>
    `;

    products.forEach(product => {

        productOptions += `

            <option value="${product.id}">

                ${product.product}

            </option>

        `;

    });

    purchaseTable.insertAdjacentHTML("beforeend", `

<tr>

<td>

<select class="productSelect">

${productOptions}

</select>

</td>

<td>

<input
type="text"
class="batch">

</td>

<td>

<input
type="date"
class="expiry">

</td>

<td>

<input
type="number"
class="qty"
min="1"
value="1">

</td>

<td>

<input
type="number"
class="rate"
step="0.01">

</td>

<td>

<input
type="number"
class="gst"
step="0.01">

</td>

<td>

<input
type="number"
class="amount"
readonly>

</td>

<td>

<button
class="remove-btn">

Remove

</button>

</td>

</tr>

`);

}

/* =====================================================
   REMOVE ROW
===================================================== */

purchaseTable.addEventListener("click", (e) => {

    if (!e.target.classList.contains("remove-btn")) return;

    e.target.closest("tr").remove();

});

/* =====================================================
   PRODUCT CHANGE
===================================================== */

purchaseTable.addEventListener("change", (e) => {

    if (!e.target.classList.contains("productSelect")) return;

    const row = e.target.closest("tr");

    const id = Number(e.target.value);

    const product = products.find(p => p.id === id);

    if (!product) return;

    row.querySelector(".rate").value =
        product.purchase_rate || 0;

    row.querySelector(".gst").value =
        product.gst || 0;

});

/* =====================================================
   END PART 1
===================================================== */

console.log("Purchase Module Part 1 Loaded");

/* =====================================================
   PURCHASE MODULE
   PART 2 - CALCULATIONS
===================================================== */

/* =====================================================
   INPUT EVENTS
===================================================== */

purchaseTable.addEventListener("input", (e) => {

    const row = e.target.closest("tr");

    if (!row) return;

    calculateRow(row);

    calculateTotals();

});

/* =====================================================
   CALCULATE ROW
===================================================== */

function calculateRow(row) {

    const qty = Number(
        row.querySelector(".qty").value || 0
    );

    const rate = Number(
        row.querySelector(".rate").value || 0
    );

    const gst = Number(
        row.querySelector(".gst").value || 0
    );

    const basicAmount = qty * rate;

    const gstAmount = basicAmount * gst / 100;

    const totalAmount = basicAmount + gstAmount;

    row.querySelector(".amount").value =
        totalAmount.toFixed(2);

}

/* =====================================================
   CALCULATE TOTALS
===================================================== */

function calculateTotals() {

    let sub = 0;

    let gst = 0;

    let grand = 0;

    document.querySelectorAll("#purchaseTable tr")
        .forEach(row => {

            const qty = Number(
                row.querySelector(".qty").value || 0
            );

            const rate = Number(
                row.querySelector(".rate").value || 0
            );

            const gstPercent = Number(
                row.querySelector(".gst").value || 0
            );

            const basic = qty * rate;

            const gstValue = basic * gstPercent / 100;

            sub += basic;

            gst += gstValue;

            grand += basic + gstValue;

        });

    subtotal.textContent = sub.toFixed(2);

    gstTotal.textContent = gst.toFixed(2);

    grandTotal.textContent = grand.toFixed(2);

}

/* =====================================================
   PRODUCT CHANGE
===================================================== */

purchaseTable.addEventListener("change", (e) => {

    if (!e.target.classList.contains("productSelect"))
        return;

    const row = e.target.closest("tr");

    const productId = Number(e.target.value);

    const product = products.find(p => p.id === productId);

    if (!product) return;

    row.querySelector(".rate").value =
        product.purchase_rate || 0;

    row.querySelector(".gst").value =
        product.gst || 0;

    calculateRow(row);

    calculateTotals();

});

/* =====================================================
   AUTO ADD ROW
===================================================== */

purchaseTable.addEventListener("keydown", (e) => {

    if (e.key !== "Enter") return;

    const row = e.target.closest("tr");

    if (!row) return;

    const rows = purchaseTable.querySelectorAll("tr");

    if (row !== rows[rows.length - 1]) return;

    e.preventDefault();

    addPurchaseRow();

});

/* =====================================================
   REMOVE ROW
===================================================== */

purchaseTable.addEventListener("click", (e) => {

    if (!e.target.classList.contains("remove-btn"))
        return;

    const rows = purchaseTable.querySelectorAll("tr");

    if (rows.length === 1) {

        alert("At least one product row is required.");

        return;

    }

    e.target.closest("tr").remove();

    calculateTotals();

});

/* =====================================================
   INITIAL TOTALS
===================================================== */

calculateTotals();

console.log("Purchase Module Part 2 Loaded");

/* =====================================================
   PURCHASE MODULE
   PART 3 - SAVE PURCHASE
===================================================== */

const savePurchaseBtn = document.getElementById("savePurchaseBtn");

/* =====================================================
   SAVE PURCHASE
===================================================== */

savePurchaseBtn.addEventListener("click", savePurchase);

async function savePurchase() {

    if (!supplierSelect.value) {
        alert("Please select a supplier.");
        supplierSelect.focus();
        return;
    }

    const rows = [...purchaseTable.querySelectorAll("tr")];

    if (rows.length === 0) {
        alert("Please add at least one product.");
        return;
    }

    const items = [];

    for (const row of rows) {

        const productId = Number(
            row.querySelector(".productSelect").value
        );

        if (!productId) {
            alert("Please select a product.");
            return;
        }

        const qty = Number(
            row.querySelector(".qty").value || 0
        );

        if (qty <= 0) {
            alert("Quantity must be greater than zero.");
            return;
        }

        items.push({

            product_id: productId,

            batch: row.querySelector(".batch").value,

            expiry: row.querySelector(".expiry").value || null,

            qty: qty,

            purchase_rate: Number(
                row.querySelector(".rate").value || 0
            ),

            gst: Number(
                row.querySelector(".gst").value || 0
            ),

            amount: Number(
                row.querySelector(".amount").value || 0
            )

        });

    }

    /* ===========================
       SAVE MASTER
    ============================ */

    const { data: master, error: masterError } =
        await supabase

            .from("purchase_master")

            .insert([{

                invoice_no:
                    document.getElementById("invoiceNo").value,

                supplier_id:
                    Number(supplierSelect.value),

                purchase_date:
                    purchaseDate.value,

                subtotal:
                    Number(subtotal.textContent),

                gst_total:
                    Number(gstTotal.textContent),

                grand_total:
                    Number(grandTotal.textContent),

                remarks:
                    document.getElementById("remarks").value

            }])

            .select()

            .single();

    if (masterError) {

        console.error(masterError);

        alert(masterError.message);

        return;

    }

    /* ===========================
       SAVE ITEMS
    ============================ */

    const purchaseItems = items.map(item => ({

        purchase_id: master.id,

        ...item

    }));

    const { error: itemError } = await supabase

        .from("purchase_items")

        .insert(purchaseItems);

    if (itemError) {

        console.error(itemError);

        alert(itemError.message);

        return;

    }

    /* ===========================
       UPDATE STOCK
    ============================ */

    for (const item of items) {

        const product = products.find(

            p => p.id === item.product_id

        );

        if (!product) continue;

        const newQty =
            Number(product.quantity || 0) +
            Number(item.qty);

        const { error } = await supabase

            .from("products")

            .update({

                quantity: newQty,

                purchase_rate: item.purchase_rate

            })

            .eq("id", item.product_id);

        if (error) {

            console.error(error);

        }

    }

    alert("Purchase Saved Successfully.");

    resetPurchaseForm();

}

/* =====================================================
   RESET FORM
===================================================== */

function resetPurchaseForm() {

    supplierSelect.value = "";

    document.getElementById("invoiceNo").value = "";

    document.getElementById("remarks").value = "";

    purchaseDate.value =
        new Date().toISOString().split("T")[0];

    purchaseTable.innerHTML = "";

    addPurchaseRow();

    calculateTotals();

}

