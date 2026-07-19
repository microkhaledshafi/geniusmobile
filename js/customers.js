import { supabase } from "./supabase.js";

/* =====================================================
   CUSTOMERS MODULE
   PART 1 - FOUNDATION
===================================================== */

let customers = [];
let editingId = null;

/* =====================================================
   DOM ELEMENTS
===================================================== */

const customerTable = document.getElementById("customerTable");
const customerModal = document.getElementById("customerModal");
const customerForm = document.getElementById("customerForm");

const modalTitle = document.getElementById("modalTitle");

const addCustomerBtn = document.getElementById("addCustomerBtn");
const closeModal = document.getElementById("closeModal");
const saveCustomerBtn = document.getElementById("saveCustomerBtn");

const searchCustomer = document.getElementById("searchCustomer");
const customerCount = document.getElementById("customerCount");

const customerName = document.getElementById("customerName");
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

    await loadCustomers();

}

/* =====================================================
   LOAD CUSTOMERS
===================================================== */

async function loadCustomers() {

    customerTable.innerHTML = `
        <tr>
            <td colspan="8" style="text-align:center;">
                Loading Customers...
            </td>
        </tr>
    `;

    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true });

    if (error) {

        console.error("Load Error:", error);

        customerTable.innerHTML = `
            <tr>
                <td colspan="8" style="color:red;text-align:center;">
                    Failed to load customers.
                </td>
            </tr>
        `;

        return;
    }

    customers = data || [];

    renderCustomers();

}

/* =====================================================
   RENDER TABLE
===================================================== */

function renderCustomers(list = customers) {

    if (!list.length) {

        customerTable.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    No Customers Found
                </td>
            </tr>
        `;

        updateCustomerCount(0);

        return;

    }

    let html = "";

    list.forEach(customer => {

        html += `

        <tr>

            <td>${customer.name ?? ""}</td>

            <td>${customer.phone ?? ""}</td>

            <td>${customer.email ?? ""}</td>

            <td>${customer.gst ?? ""}</td>

            <td>${customer.address ?? ""}</td>

            <td>${formatCurrency(customer.opening_balance)}</td>

            <td>${formatDate(customer.created_at)}</td>

            <td>

                <button
                    class="edit-btn"
                    data-id="${customer.id}">

                    Edit

                </button>

                <button
                    class="delete-btn"
                    data-id="${customer.id}">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

    customerTable.innerHTML = html;

    updateCustomerCount(list.length);

}

/* =====================================================
   CUSTOMER COUNT
===================================================== */

function updateCustomerCount(count) {

    if (!customerCount) return;

    customerCount.textContent = count;

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
   PART 2 - ADD / EDIT / SAVE CUSTOMER
===================================================== */

/* =====================================================
   OPEN MODAL
===================================================== */

addCustomerBtn.addEventListener("click", () => {

    editingId = null;

    customerForm.reset();

    openingBalance.value = 0;

    modalTitle.textContent = "Add Customer";

    customerModal.style.display = "flex";

    customerName.focus();

});

/* =====================================================
   CLOSE MODAL
===================================================== */

closeModal.addEventListener("click", closeCustomerModal);

window.addEventListener("click", (e) => {

    if (e.target === customerModal) {

        closeCustomerModal();

    }

});

function closeCustomerModal() {

    customerModal.style.display = "none";

    editingId = null;

    customerForm.reset();

}

/* =====================================================
   SAVE CUSTOMER
===================================================== */

customerForm.addEventListener("submit", saveCustomer);

async function saveCustomer(e) {

    e.preventDefault();

    if (customerName.value.trim() === "") {

        alert("Customer Name is required.");

        customerName.focus();

        return;

    }

    const customerData = {

        name: customerName.value.trim(),

        phone: phone.value.trim(),

        email: email.value.trim(),

        gst: gst.value.trim(),

        address: address.value.trim(),

        opening_balance: Number(openingBalance.value || 0)

    };

    let result;

    if (editingId === null) {

        result = await supabase
            .from("customers")
            .insert([customerData]);

    } else {

        result = await supabase
            .from("customers")
            .update(customerData)
            .eq("id", editingId);

    }

    if (result.error) {

        console.error(result.error);

        alert(result.error.message);

        return;

    }

    closeCustomerModal();

    await loadCustomers();

}

/* =====================================================
   EDIT CUSTOMER
===================================================== */

customerTable.addEventListener("click", (e) => {

    const button = e.target.closest(".edit-btn");

    if (!button) return;

    editingId = Number(button.dataset.id);

    const customer = customers.find(c => c.id === editingId);

    if (!customer) return;

    modalTitle.textContent = "Edit Customer";

    customerName.value = customer.name || "";

    phone.value = customer.phone || "";

    email.value = customer.email || "";

    gst.value = customer.gst || "";

    address.value = customer.address || "";

    openingBalance.value = customer.opening_balance || 0;

    customerModal.style.display = "flex";

    customerName.focus();

});

/* =====================================================
   PART 3 - DELETE / SEARCH / SHORTCUTS
===================================================== */

/* =====================================================
   DELETE CUSTOMER
===================================================== */

customerTable.addEventListener("click", async (e) => {

    const button = e.target.closest(".delete-btn");

    if (!button) return;

    const id = Number(button.dataset.id);

    const customer = customers.find(c => c.id === id);

    if (!customer) return;

    const ok = confirm(
        `Delete customer "${customer.name}" ?`
    );

    if (!ok) return;

    const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    await loadCustomers();

});

/* =====================================================
   SEARCH
===================================================== */

searchCustomer.addEventListener("input", () => {

    const keyword = searchCustomer.value
        .trim()
        .toLowerCase();

    if (keyword === "") {

        renderCustomers();

        return;

    }

    const filtered = customers.filter(customer =>

        (customer.name || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (customer.phone || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (customer.email || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (customer.gst || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (customer.address || "")
            .toLowerCase()
            .includes(keyword)

    );

    renderCustomers(filtered);

});

/* =====================================================
   KEYBOARD SHORTCUTS
===================================================== */

document.addEventListener("keydown", (e) => {

    // ESC closes modal

    if (
        e.key === "Escape" &&
        customerModal.style.display === "flex"
    ) {

        closeCustomerModal();

    }

});

/* =====================================================
   REFRESH
===================================================== */

async function refreshCustomers() {

    await loadCustomers();

}

/* =====================================================
   RESET SEARCH
===================================================== */

function resetCustomerSearch() {

    searchCustomer.value = "";

    renderCustomers();

}

/* =====================================================
   SORT
===================================================== */

function sortCustomers() {

    customers.sort((a, b) =>

        (a.name || "")
            .localeCompare(b.name || "")

    );

}

/* =====================================================
   RELOAD
===================================================== */

async function reloadModule() {

    await loadCustomers();

}

/* =====================================================
   INITIALIZE
===================================================== */

sortCustomers();
updateCustomerCount(customers.length);

console.log("Customers Module Loaded Successfully");

