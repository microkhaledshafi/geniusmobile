import { supabase } from "./supabase.js";

/* ======================================================
   CUSTOMERS MODULE
   PART 1 OF 4
====================================================== */

let customers = [];
let editingId = null;

/* -------------------------
   DOM ELEMENTS
------------------------- */

const customerTable = document.getElementById("customerTable");
const customerForm = document.getElementById("customerForm");
const customerModal = document.getElementById("customerModal");
const modalTitle = document.getElementById("modalTitle");

const addCustomerBtn = document.getElementById("addCustomerBtn");
const closeModal = document.getElementById("closeModal");
const saveCustomerBtn = document.getElementById("saveCustomerBtn");

const searchCustomer = document.getElementById("searchCustomer");

const customerName = document.getElementById("customerName");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const gst = document.getElementById("gst");
const address = document.getElementById("address");
const openingBalance = document.getElementById("openingBalance");

/* -------------------------
   PAGE LOAD
------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    loadCustomers();

});

/* -------------------------
   LOAD CUSTOMERS
------------------------- */

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

        console.error(error);

        customerTable.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align:center;color:red;">
                    Error Loading Customers
                </td>
            </tr>
        `;

        return;
    }

    customers = data || [];

    sortCustomers();

}

/* -------------------------
   RENDER CUSTOMERS
------------------------- */

function renderCustomers(list) {

    if (list.length === 0) {

        customerTable.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align:center;">
                    No Customers Found
                </td>
            </tr>
        `;

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

            <td>${formatAmount(customer.opening_balance)}</td>

            <td>${formatDate(customer.created_at)}</td>
                .toLocaleDateString() : ""}</td>

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

}

/* -------------------------
   SEARCH CUSTOMERS
------------------------- */

searchCustomer.addEventListener("keyup", () => {

    const keyword = searchCustomer.value
        .trim()
        .toLowerCase();

    if (keyword === "") {

        renderCustomers(customers);

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

    );

    renderCustomers(filtered);

});

/* ======================================================
   PART 2 OF 4
   ADD / EDIT / SAVE CUSTOMER
====================================================== */

/* -------------------------
   OPEN ADD CUSTOMER
------------------------- */

addCustomerBtn.addEventListener("click", () => {

    editingId = null;

    modalTitle.textContent = "Add Customer";

    clearForm();

    customerModal.style.display = "flex";

});

/* -------------------------
   CLOSE MODAL
------------------------- */

closeModal.addEventListener("click", () => {

    customerModal.style.display = "none";

});

window.addEventListener("click", (e) => {

    if (e.target === customerModal) {

        customerModal.style.display = "none";

    }

});

/* -------------------------
   CLEAR FORM
------------------------- */

function clearForm() {

    customerForm.reset();

    customerName.focus();

}

/* -------------------------
   SAVE CUSTOMER
------------------------- */

saveCustomerBtn.addEventListener("click", async (e) => {

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

        opening_balance:
            Number(openingBalance.value) || 0

    };

    let error;

    if (editingId === null) {

        ({ error } = await supabase

            .from("customers")

            .insert([customerData]));

    } else {

        ({ error } = await supabase

            .from("customers")

            .update(customerData)

            .eq("id", editingId));

    }

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    customerModal.style.display = "none";

    clearForm();

    await loadCustomers();

});

/* -------------------------
   EDIT CUSTOMER
------------------------- */

customerTable.addEventListener("click", (e) => {

    const editButton = e.target.closest(".edit-btn");

    if (!editButton) return;

    editingId = editButton.dataset.id;

    const customer = customers.find(c => c.id == editingId);

    if (!customer) return;

    modalTitle.textContent = "Edit Customer";

    customerName.value = customer.name || "";

    phone.value = customer.phone || "";

    email.value = customer.email || "";

    gst.value = customer.gst || "";

    address.value = customer.address || "";

    openingBalance.value =
        customer.opening_balance || 0;

    customerModal.style.display = "flex";

});

/* ======================================================
   PART 3 OF 4
   DELETE / SHORTCUTS / UTILITIES
====================================================== */

/* -------------------------
   DELETE CUSTOMER
------------------------- */

customerTable.addEventListener("click", async (e) => {

    const deleteButton = e.target.closest(".delete-btn");

    if (!deleteButton) return;

    const id = deleteButton.dataset.id;

    const confirmDelete = confirm(
        "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

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

/* -------------------------
   KEYBOARD SHORTCUTS
------------------------- */

document.addEventListener("keydown", (e) => {

    // ESC closes modal
    if (
        e.key === "Escape" &&
        customerModal.style.display === "flex"
    ) {

        customerModal.style.display = "none";

    }

    // CTRL + N opens Add Customer
    if (e.ctrlKey && e.key.toLowerCase() === "n") {

        e.preventDefault();

        editingId = null;

        clearForm();

        modalTitle.textContent = "Add Customer";

        customerModal.style.display = "flex";

    }

});

/* -------------------------
   REFRESH CUSTOMER LIST
------------------------- */

async function refreshCustomers() {

    await loadCustomers();

}

/* -------------------------
   RESET SEARCH
------------------------- */

function resetCustomerSearch() {

    if (!searchCustomer) return;

    searchCustomer.value = "";

    renderCustomers(customers);

}

/* -------------------------
   FORMAT NUMBER
------------------------- */

function formatAmount(value) {

    return Number(value || 0).toFixed(2);

}

/* -------------------------
   FORMAT DATE
------------------------- */

function formatDate(date) {

    if (!date) return "";

    return new Date(date).toLocaleDateString();

}

/* ======================================================
   PART 4 OF 4
   FINAL HELPERS / SORTING / COUNT / PROTECTION
====================================================== */

let savingCustomer = false;

/* -------------------------
   RELOAD
------------------------- */

async function reloadCustomers() {

    await loadCustomers();

}

/* -------------------------
   CLOSE CUSTOMER MODAL
------------------------- */

function closeCustomerModal() {

    customerModal.style.display = "none";

    editingId = null;

    clearForm();

}

/* -------------------------
   PREVENT DOUBLE SAVE
------------------------- */

const originalSaveHandler = saveCustomerBtn.onclick;

saveCustomerBtn.addEventListener("click", () => {

    if (savingCustomer) return;

    savingCustomer = true;

    setTimeout(() => {

        savingCustomer = false;

    }, 1000);

});

/* -------------------------
   CUSTOMER COUNT
------------------------- */

function updateCustomerCount() {

    const element = document.getElementById("customerCount");

    if (!element) return;

    element.textContent = customers.length;

}

/* -------------------------
   SORT BY NAME
------------------------- */

function sortCustomers() {

    customers.sort((a, b) => {

        return (a.name || "")
            .localeCompare(b.name || "");

    });

    renderCustomers(customers);

}

/* -------------------------
   REFRESH MODULE
------------------------- */

async function refreshModule() {

    await reloadCustomers();

    sortCustomers();

    updateCustomerCount();

}

/* -------------------------
   UPDATE COUNT AFTER RENDER
------------------------- */

const originalRenderCustomers = renderCustomers;

renderCustomers = function(list) {

    originalRenderCustomers(list);

    updateCustomerCount();

};

