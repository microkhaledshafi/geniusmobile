import { supabase } from "./supabase.js";

/* =====================================================
   PURCHASE REGISTER
   PART 1 - INITIALIZATION
===================================================== */

let purchases = [];
let deleteId = null;

/* =====================================================
   DOM ELEMENTS
===================================================== */

const purchaseBody = document.getElementById("purchaseBody");
const searchPurchase = document.getElementById("searchPurchase");

const purchaseCount = document.getElementById("purchaseCount");
const purchaseAmount = document.getElementById("purchaseAmount");

const newPurchaseBtn = document.getElementById("newPurchaseBtn");

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadPurchases();

});

/* =====================================================
   NEW PURCHASE
===================================================== */

if (newPurchaseBtn) {

    newPurchaseBtn.addEventListener("click", () => {

        window.location.href = "purchase-form.html";

    });

}

/* =====================================================
   LOAD PURCHASES
===================================================== */

async function loadPurchases() {

    purchaseBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center;padding:20px;">
                Loading purchases...
            </td>
        </tr>
    `;

    const { data, error } = await supabase

        .from("purchase_master")

        .select(`
            id,
            supplier_invoice_no,
            purchase_date,
            supplier_id,
            grand_total,
            status,
            attachment_url,
            suppliers(name)
        `)

        .order("purchase_date", { ascending: false });

    if (error) {

        console.error(error);

        purchaseBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;color:red;">
                    ${error.message}
                </td>
            </tr>
        `;

        return;

    }

    purchases = data || [];

    renderPurchases(purchases);

    updateSummary();

}

/* =====================================================
   SUMMARY
===================================================== */

function updateSummary() {

    purchaseCount.textContent = purchases.length;

    let total = 0;

    purchases.forEach(item => {

        total += Number(item.grand_total || 0);

    });

    purchaseAmount.textContent =
        "₹ " + total.toFixed(2);

}

/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(date) {

    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN");

}

console.log("Purchase Register Part 1 Loaded");

/* =====================================================
   RENDER PURCHASES
===================================================== */

function renderPurchases(rows) {

    purchaseBody.innerHTML = "";

    if (rows.length === 0) {

        purchaseBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:20px;">
                    No purchase records found.
                </td>
            </tr>
        `;

        return;
    }

    rows.forEach((purchase) => {

        purchaseBody.insertAdjacentHTML("beforeend", `

            <tr>

                <td>${purchase.supplier_invoice_no || "-"}</td>

                <td>${formatDate(purchase.purchase_date)}</td>

                <td>${purchase.suppliers?.name || "-"}</td>

                <td>₹ ${Number(purchase.grand_total || 0).toFixed(2)}</td>

                <td>

                    ${
                        purchase.attachment_url
                        ?
                        `<a href="${purchase.attachment_url}" target="_blank">
                            📎 View
                        </a>`
                        :
                        "-"
                    }

                </td>

                <td>

                    <span class="status-badge">

                        ${purchase.status || "Saved"}

                    </span>

                </td>

                <td>

                    <button
                        class="edit-btn"
                        onclick="editPurchase(${purchase.id})">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="showDeleteModal(${purchase.id})">

                        Delete

                    </button>

                </td>

            </tr>

        `);

    });

}

/* =====================================================
   SEARCH
===================================================== */

if (searchPurchase) {

    searchPurchase.addEventListener("input", function () {

        const keyword = this.value
            .toLowerCase()
            .trim();

        if (keyword === "") {

            renderPurchases(purchases);

            return;

        }

        const filtered = purchases.filter(item => {

            return (

                (item.supplier_invoice_no || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (item.suppliers?.name || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (item.status || "")
                .toLowerCase()
                .includes(keyword)

            );

        });

        renderPurchases(filtered);

    });

}

/* =====================================================
   EDIT PURCHASE
===================================================== */

window.editPurchase = function(id) {

    window.location.href =
        `purchase-form.html?id=${id}`;

};

/* =====================================================
   DELETE MODAL
===================================================== */

window.showDeleteModal = function(id) {

    deleteId = id;

    deleteModal.style.display = "flex";

};

if (cancelDeleteBtn) {

    cancelDeleteBtn.addEventListener("click", () => {

        deleteModal.style.display = "none";

        deleteId = null;

    });

}

window.addEventListener("click", (e) => {

    if (e.target === deleteModal) {

        deleteModal.style.display = "none";

        deleteId = null;

    }

});

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        deleteModal.style.display = "none";

        deleteId = null;

    }

});

console.log("Purchase Register Part 2 Loaded");

/* =====================================================
   DELETE PURCHASE
===================================================== */

if (confirmDeleteBtn) {

    confirmDeleteBtn.addEventListener("click", async () => {

        if (!deleteId) return;

        await deletePurchase(deleteId);

        deleteModal.style.display = "none";

        deleteId = null;

    });

}

async function deletePurchase(id) {

    try {

        /* =============================
           GET PURCHASE ITEMS
        ============================== */

        const { data: items, error: itemFetchError } =
            await supabase
                .from("purchase_items")
                .select("*")
                .eq("purchase_id", id);

        if (itemFetchError) throw itemFetchError;

        /* =============================
           REVERSE PRODUCT STOCK
        ============================== */

        for (const item of (items || [])) {

            const { data: product, error: productError } =
                await supabase
                    .from("products")
                    .select("id, quantity")
                    .eq("id", item.product_id)
                    .single();

            if (productError) continue;

            const newQty =
                Math.max(
                    0,
                    Number(product.quantity || 0) -
                    Number(item.qty || 0)
                );

            await supabase
                .from("products")
                .update({
                    quantity: newQty
                })
                .eq("id", item.product_id);

        }

        /* =============================
           DELETE PURCHASE ITEMS
        ============================== */

        const { error: deleteItemsError } =
            await supabase
                .from("purchase_items")
                .delete()
                .eq("purchase_id", id);

        if (deleteItemsError) throw deleteItemsError;

        /* =============================
           DELETE MASTER
        ============================== */

        const { error: deleteMasterError } =
            await supabase
                .from("purchase_master")
                .delete()
                .eq("id", id);

        if (deleteMasterError) throw deleteMasterError;

        /* =============================
           REMOVE FROM LOCAL ARRAY
        ============================== */

        purchases = purchases.filter(
            purchase => purchase.id !== id
        );

        renderPurchases(purchases);

        updateSummary();

        alert("Purchase deleted successfully.");

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

}

/* =====================================================
   REFRESH
===================================================== */

async function refreshPurchases() {

    await loadPurchases();

}

console.log("Purchase Register Part 3 Loaded");

