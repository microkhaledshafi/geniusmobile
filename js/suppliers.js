import { supabase } from "./supabase.js";

/* =====================================================
   SUPPLIERS MODULE
   PART 1 - FOUNDATION
===================================================== */

let suppliers = [];
let editingId = null;

/* =====================================================
   DOM ELEMENTS
===================================================== */

const supplierTable = document.getElementById("supplierTable");
const supplierModal = document.getElementById("supplierModal");
const supplierForm = document.getElementById("supplierForm");

const modalTitle = document.getElementById("modalTitle");

const addSupplierBtn = document.getElementById("addSupplierBtn");
const closeModal = document.getElementById("closeModal");
const saveSupplierBtn = document.getElementById("saveSupplierBtn");

const searchSupplier = document.getElementById("searchSupplier");
const supplierCount = document.getElementById("supplierCount");

const supplierName = document.getElementById("supplierName");
const contactPerson = document.getElementById("contactPerson");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const gst = document.getElementById("gst");
const address = document.getElementById("address");
const openingBalance = document.getElementById("openingBalance");

/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializePage();
});

async function initializePage() {
    await loadSuppliers();
}

/* =====================================================
   LOAD SUPPLIERS
===================================================== */

async function loadSuppliers() {

    supplierTable.innerHTML = `
        <tr>
            <td colspan="9" style="text-align:center;">
                Loading Suppliers...
            </td>
        </tr>
    `;

    const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name", { ascending: true });

    if (error) {

        console.error("Load Error:", error);

        supplierTable.innerHTML = `
            <tr>
                <td colspan="9" style="color:red;text-align:center;">
                    Failed to load suppliers.
                </td>
            </tr>
        `;

        return;
    }

    suppliers = data || [];

    renderSuppliers();

}

/* =====================================================
   RENDER TABLE
===================================================== */

function renderSuppliers(list = suppliers) {

    if (!list.length) {

        supplierTable.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;">
                    No Suppliers Found
                </td>
            </tr>
        `;

        updateSupplierCount(0);

        return;
    }

    let html = "";

    list.forEach(supplier => {

        html += `
        <tr>

            <td>${supplier.name ?? ""}</td>

            <td>${supplier.contact_person ?? ""}</td>

            <td>${supplier.phone ?? ""}</td>

            <td>${supplier.email ?? ""}</td>

            <td>${supplier.gst ?? ""}</td>

            <td>${supplier.address ?? ""}</td>

            <td>${formatCurrency(supplier.opening_balance)}</td>

            <td>${formatDate(supplier.created_at)}</td>

            <td>

                <button
                    class="edit-btn"
                    data-id="${supplier.id}">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    data-id="${supplier.id}">
                    Delete
                </button>

            </td>

        </tr>
        `;

    });

    supplierTable.innerHTML = html;

    updateSupplierCount(list.length);

}

/* =====================================================
   SUPPLIER COUNT
===================================================== */

function updateSupplierCount(count) {

    if (!supplierCount) return;

    supplierCount.textContent = count;

}

/* =====================================================
   UTILITIES
===================================================== */

function formatCurrency(value) {
    return Number(value || 0).toFixed(2);
}

function formatDate(value) {

    if (!value) return "";

    return new Date(value).toLocaleDateString();

}

/* =====================================================
   PART 2 - ADD / EDIT / SAVE SUPPLIER
===================================================== */

/* =====================================================
   OPEN MODAL
===================================================== */

addSupplierBtn.addEventListener("click", () => {

    editingId = null;

    supplierForm.reset();

    openingBalance.value = 0;

    modalTitle.textContent = "Add Supplier";

    supplierModal.style.display = "flex";

    supplierName.focus();

});

/* =====================================================
   CLOSE MODAL
===================================================== */

closeModal.addEventListener("click", closeSupplierModal);

window.addEventListener("click", (e) => {

    if (e.target === supplierModal) {

        closeSupplierModal();

    }

});

function closeSupplierModal() {

    supplierModal.style.display = "none";

    editingId = null;

    supplierForm.reset();

}

/* =====================================================
   SAVE SUPPLIER
===================================================== */

supplierForm.addEventListener("submit", saveSupplier);

async function saveSupplier(e) {

    e.preventDefault();

    if (supplierName.value.trim() === "") {

        alert("Supplier Name is required.");

        supplierName.focus();

        return;

    }

    const supplierData = {

        name: supplierName.value.trim(),

        contact_person: contactPerson.value.trim(),

        phone: phone.value.trim(),

        email: email.value.trim(),

        gst: gst.value.trim(),

        address: address.value.trim(),

        opening_balance: Number(openingBalance.value || 0)

    };

    let result;

    if (editingId === null) {

        result = await supabase
            .from("suppliers")
            .insert([supplierData]);

    } else {

        result = await supabase
            .from("suppliers")
            .update(supplierData)
            .eq("id", editingId);

    }

    if (result.error) {

        console.error(result.error);

        alert(result.error.message);

        return;

    }

    closeSupplierModal();

    await loadSuppliers();

}

/* =====================================================
   EDIT SUPPLIER
===================================================== */

supplierTable.addEventListener("click", (e) => {

    const button = e.target.closest(".edit-btn");

    if (!button) return;

    editingId = Number(button.dataset.id);

    const supplier = suppliers.find(s => s.id === editingId);

    if (!supplier) return;

    modalTitle.textContent = "Edit Supplier";

    supplierName.value = supplier.name || "";

    contactPerson.value = supplier.contact_person || "";

    phone.value = supplier.phone || "";

    email.value = supplier.email || "";

    gst.value = supplier.gst || "";

    address.value = supplier.address || "";

    openingBalance.value = supplier.opening_balance || 0;

    supplierModal.style.display = "flex";

    supplierName.focus();

});

/* =====================================================
   PART 3 - DELETE / SEARCH / SHORTCUTS
===================================================== */

/* =====================================================
   DELETE SUPPLIER
===================================================== */

supplierTable.addEventListener("click", async (e) => {

    const button = e.target.closest(".delete-btn");

    if (!button) return;

    const id = Number(button.dataset.id);

    const supplier = suppliers.find(s => s.id === id);

    if (!supplier) return;

    const ok = confirm(
        `Delete supplier "${supplier.name}" ?`
    );

    if (!ok) return;

    const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id);

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    await loadSuppliers();

});

/* =====================================================
   SEARCH
===================================================== */

searchSupplier.addEventListener("input", () => {

    const keyword = searchSupplier.value
        .trim()
        .toLowerCase();

    if (keyword === "") {

        renderSuppliers();

        return;

    }

    const filtered = suppliers.filter(supplier =>

        (supplier.name || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (supplier.contact_person || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (supplier.phone || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (supplier.email || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (supplier.gst || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (supplier.address || "")
            .toLowerCase()
            .includes(keyword)

    );

    renderSuppliers(filtered);

});

/* =====================================================
   KEYBOARD SHORTCUTS
===================================================== */

document.addEventListener("keydown", (e) => {

    if (
        e.key === "Escape" &&
        supplierModal.style.display === "flex"
    ) {

        closeSupplierModal();

    }

});

/* =====================================================
   REFRESH
===================================================== */

async function refreshSuppliers() {

    await loadSuppliers();

}

/* =====================================================
   RESET SEARCH
===================================================== */

function resetSupplierSearch() {

    searchSupplier.value = "";

    renderSuppliers();

}

/* =====================================================
   SORT
===================================================== */

function sortSuppliers() {

    suppliers.sort((a, b) =>

        (a.name || "")
            .localeCompare(b.name || "")

    );

}

/* =====================================================
   RELOAD
===================================================== */

async function reloadModule() {

    await loadSuppliers();

}

/* =====================================================
   INITIALIZE
===================================================== */

sortSuppliers();

updateSupplierCount(suppliers.length);

console.log("Suppliers Module Loaded Successfully");
