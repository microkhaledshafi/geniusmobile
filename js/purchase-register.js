import { supabase } from "./supabase.js";

/* ==========================================
   PURCHASE REGISTER
========================================== */

const purchaseBody = document.getElementById("purchaseBody");
const purchaseCount = document.getElementById("purchaseCount");
const purchaseAmount = document.getElementById("purchaseAmount");
const searchPurchase = document.getElementById("searchPurchase");
const newPurchaseBtn = document.getElementById("newPurchaseBtn");

let purchases = [];
let deleteId = null;

/* ==========================================
   PAGE LOAD
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadPurchases();

});

/* ==========================================
   NEW PURCHASE
========================================== */

newPurchaseBtn.addEventListener("click", () => {

    window.location.href = "purchase-form.html";

});

/* ==========================================
   LOAD PURCHASES
========================================== */

async function loadPurchases() {

    purchaseBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center;">
                Loading...
            </td>
        </tr>
    `;

    const { data, error } = await supabase
        .from("purchase_master")
        .select(`
            *,
            suppliers(
                id,
                name
            )
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

/* ==========================================
   SUMMARY CARDS
========================================== */

function updateSummary() {

    purchaseCount.textContent = purchases.length;

    let total = 0;

    purchases.forEach(p => {

        total += Number(p.grand_total || 0);

    });

    purchaseAmount.textContent =
        "₹" + total.toLocaleString("en-IN", {
            minimumFractionDigits: 2
        });

}

/* ==========================================
   DATE FORMAT
========================================== */

function formatDate(date) {

    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN");

}

/* ==========================================
   RENDER PURCHASES
========================================== */

function renderPurchases(data) {

    purchaseBody.innerHTML = "";

    if (data.length === 0) {

        purchaseBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No purchases found.
                </td>
            </tr>
        `;

        return;
    }

    data.forEach(purchase => {

        const attachment = purchase.attachment_url
            ? `<a href="${purchase.attachment_url}" target="_blank">
                    <i class="fa-solid fa-paperclip"></i>
               </a>`
            : "-";

        const statusClass =
            purchase.status === "Cancelled"
                ? "badge-danger"
                : purchase.status === "Pending"
                ? "badge-warning"
                : "badge-success";

        purchaseBody.insertAdjacentHTML("beforeend", `

<tr>

<td>${purchase.supplier_invoice_no || ""}</td>

<td>${formatDate(purchase.purchase_date)}</td>

<td>${purchase.suppliers?.name || ""}</td>

<td>₹${Number(purchase.grand_total || 0).toFixed(2)}</td>

<td>
<span class="${statusClass}">
${purchase.status || "Saved"}
</span>
</td>

<td>
${attachment}
</td>

<td>


<button
class="icon-btn print-btn"
data-id="${purchase.id}"
title="Print">

<i class="fa-solid fa-print"></i>

</button>

</td>

</tr>

        `);

    });

}

/* ==========================================
   SEARCH PURCHASES
========================================== */

searchPurchase.addEventListener("input", () => {

    const keyword = searchPurchase.value
        .trim()
        .toLowerCase();

    const filtered = purchases.filter(p => {

        const invoice =
            (p.supplier_invoice_no || "")
            .toLowerCase();

        const supplier =
            (p.suppliers?.name || "")
            .toLowerCase();

        return invoice.includes(keyword)
            || supplier.includes(keyword);

    });

    renderPurchases(filtered);

});

/* ==========================================
   EDIT PURCHASE
========================================== */

purchaseBody.addEventListener("click", (e) => {

    const editBtn = e.target.closest(".edit-btn");

    if (!editBtn) return;

    const id = editBtn.dataset.id;

    window.location.href =
        `purchase-form.html?id=${id}`;

});

/* ==========================================
   DELETE BUTTON
========================================== */

purchaseBody.addEventListener("click", (e) => {

    const btn = e.target.closest(".delete-btn");

    if (!btn) return;

    deleteId = Number(btn.dataset.id);

    document
        .getElementById("deleteModal")
        .style.display = "flex";

});

/* ==========================================
   PRINT BUTTON
========================================== */

purchaseBody.addEventListener("click", (e) => {

    const btn = e.target.closest(".print-btn");

    if (!btn) return;

    const id = btn.dataset.id;

    window.open(
        `purchase-print.html?id=${id}`,
        "_blank"
    );

});

/* ==========================================
   DELETE MODAL
========================================== */

const deleteModal = document.getElementById("deleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

/* ==========================================
   CANCEL DELETE
========================================== */

cancelDeleteBtn.addEventListener("click", () => {

    deleteId = null;

    deleteModal.style.display = "none";

});

window.addEventListener("click", (e) => {

    if (e.target === deleteModal) {

        deleteId = null;

        deleteModal.style.display = "none";

    }

});

/* ==========================================
   CONFIRM DELETE
========================================== */

confirmDeleteBtn.addEventListener("click", async () => {

    if (!deleteId) return;

    await deletePurchase(deleteId);

    deleteModal.style.display = "none";

    deleteId = null;

});

/* ==========================================
   DELETE PURCHASE
========================================== */

async function deletePurchase(id) {

    try {

        /* =============================
           LOAD PURCHASE ITEMS
        ============================== */

        const { data: items, error: itemLoadError } =
            await supabase
                .from("purchase_items")
                .select("*")
                .eq("purchase_id", id);

        if (itemLoadError)
            throw itemLoadError;

        /* =============================
           REVERSE STOCK
        ============================== */

        for (const item of items || []) {

            const { data: product } = await supabase
                .from("products")
                .select("quantity")
                .eq("id", item.product_id)
                .single();

            if (!product) continue;

            const newQty =
                Number(product.quantity || 0) -
                Number(item.qty || 0);

            const { error } = await supabase
                .from("products")
                .update({
                    quantity: Math.max(0, newQty)
                })
                .eq("id", item.product_id);

            if (error)
                throw error;

        }

        /* =============================
           DELETE ITEMS
        ============================== */

        const { error: deleteItemsError } =
            await supabase
                .from("purchase_items")
                .delete()
                .eq("purchase_id", id);

        if (deleteItemsError)
            throw deleteItemsError;

        /* =============================
           DELETE MASTER
        ============================== */

        const { error: deleteMasterError } =
            await supabase
                .from("purchase_master")
                .delete()
                .eq("id", id);

        if (deleteMasterError)
            throw deleteMasterError;

        alert("Purchase deleted successfully.");

        await loadPurchases();

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}
