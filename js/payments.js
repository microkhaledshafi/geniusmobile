import { supabase } from "./supabase.js";

/* =====================================================
   Payments Module
===================================================== */

/* =====================================================
   Elements
===================================================== */

const paymentBody = document.getElementById("paymentBody");

const newPaymentBtn = document.getElementById("newPaymentBtn");

const searchPayment = document.getElementById("searchPayment");

const filterPartyType = document.getElementById("filterPartyType");

const totalEntries = document.getElementById("totalEntries");

const totalReceived = document.getElementById("totalReceived");

const totalPaid = document.getElementById("totalPaid");

const deleteModal = document.getElementById("deleteModal");

const cancelDelete = document.getElementById("cancelDelete");

const confirmDelete = document.getElementById("confirmDelete");


/* =====================================================
   Variables
===================================================== */

let payments = [];

let customerMap = {};

let supplierMap = {};

let deleteId = null;


/* =====================================================
   Initialize
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    await loadMasters();

    await loadPayments();

});


/* =====================================================
   Events
===================================================== */

newPaymentBtn.addEventListener("click", () => {

    window.location.href = "payment-form.html";

});

searchPayment.addEventListener("input", filterPayments);

filterPartyType.addEventListener("change", filterPayments);

cancelDelete.addEventListener("click", () => {

    deleteModal.style.display = "none";

    deleteId = null;

});

confirmDelete.addEventListener("click", deletePayment);

window.addEventListener("click", (e) => {

    if (e.target === deleteModal) {

        deleteModal.style.display = "none";

        deleteId = null;

    }

});


/* =====================================================
   Load Masters
===================================================== */

async function loadMasters() {

    customerMap = {};

    supplierMap = {};

    try {

        const { data: customers, error: customerError } =
            await supabase
                .from("customers")
                .select("id,name")
.order("name")

        if (customerError)
            throw customerError;

        customers.forEach(customer => {

            customerMap[customer.id] =
    customer.name;
        });


        const { data: suppliers, error: supplierError } =
            await supabase
                .from("suppliers")
                .select("id,name")
                .order("name")

        if (supplierError)
            throw supplierError;

        suppliers.forEach(supplier => {

            supplierMap[supplier.id] =
    supplier.name;

        });

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}


/* =====================================================
   Load Payments
===================================================== */

async function loadPayments() {

    try {

        const { data, error } = await supabase

            .from("payments")

            .select("*")

            .order("payment_date", {

                ascending: false

            });

        if (error)
            throw error;

        payments = data || [];

        updateDashboard();

        renderPayments(payments);

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

/* =====================================================
   Dashboard
===================================================== */

function updateDashboard() {

    totalEntries.textContent = payments.length;

    let received = 0;
    let paid = 0;

    payments.forEach(payment => {

        const amount = Number(payment.amount || 0);

        if (payment.payment_type === "Receive") {

            received += amount;

        }
        else if (payment.payment_type === "Pay") {

            paid += amount;

        }

    });

    totalReceived.textContent =
        "₹ " + received.toFixed(2);

    totalPaid.textContent =
        "₹ " + paid.toFixed(2);

}


/* =====================================================
   Search & Filter
===================================================== */

function filterPayments() {

    const keyword =
        searchPayment.value.trim().toLowerCase();

    const type =
        filterPartyType.value;

    const filtered = payments.filter(payment => {

        const partyName =
            getPartyName(payment).toLowerCase();

        const reference =
            (payment.reference_no || "")
            .toLowerCase();

        const remarks =
            (payment.remarks || "")
            .toLowerCase();

        const matchesSearch =

            partyName.includes(keyword) ||

            reference.includes(keyword) ||

            remarks.includes(keyword);

        const matchesType =

            !type ||

            payment.party_type === type;

        return matchesSearch && matchesType;

    });

    renderPayments(filtered);

}


/* =====================================================
   Party Name
===================================================== */

function getPartyName(payment) {

    if (payment.party_type === "Customer") {

        return customerMap[payment.party_id] || "-";

    }

    if (payment.party_type === "Supplier") {

        return supplierMap[payment.party_id] || "-";

    }

    return "-";

}

/* =====================================================
   Render Payments
===================================================== */

function renderPayments(data) {

    paymentBody.innerHTML = "";

    if (!data || data.length === 0) {

        paymentBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;padding:30px;">
                    No payments found.
                </td>
            </tr>
        `;

        return;
    }

    data.forEach(payment => {

        const partyName = getPartyName(payment);

        const amount = Number(payment.amount || 0).toFixed(2);

        paymentBody.innerHTML += `

<tr>

    <td>${formatDate(payment.payment_date)}</td>

    <td>${partyName}</td>

    <td>

        <span class="badge ${payment.party_type === "Customer"
            ? "success"
            : "warning"}">

            ${payment.party_type}

        </span>

    </td>

    <td>

        <span class="badge ${payment.payment_type === "Receive"
            ? "success"
            : "warning"}">

            ${payment.payment_type}

        </span>

    </td>

    <td>₹ ${amount}</td>

    <td>${payment.payment_mode || "-"}</td>

    <td>${payment.reference_no || "-"}</td>

    <td>${payment.remarks || "-"}</td>

    <td>

        <button
            class="icon-btn edit-btn"
            data-id="${payment.id}"
            title="Edit">

            <i class="fa-solid fa-pen"></i>

        </button>

        <button
            class="icon-btn delete-btn"
            data-id="${payment.id}"
            title="Delete">

            <i class="fa-solid fa-trash"></i>

        </button>

    </td>

</tr>

`;

    });

}


/* =====================================================
   Table Actions
===================================================== */

paymentBody.addEventListener("click", (e) => {

    const editButton = e.target.closest(".edit-btn");

    if (editButton) {

        const id = editButton.dataset.id;

        window.location.href =
            `payment-form.html?id=${id}`;

        return;

    }

    const deleteButton = e.target.closest(".delete-btn");

    if (deleteButton) {

        deleteId = deleteButton.dataset.id;

        deleteModal.style.display = "flex";

    }

});

/* =====================================================
   Delete Payment
===================================================== */

async function deletePayment() {

    if (!deleteId) return;

    try {

        const { error } = await supabase
            .from("payments")
            .delete()
            .eq("id", deleteId);

        if (error) throw error;

        deleteModal.style.display = "none";

        deleteId = null;

        await loadPayments();

        alert("Payment deleted successfully.");

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}


/* =====================================================
   Helpers
===================================================== */

function formatDate(date) {

    if (!date) return "-";

    const d = new Date(date);

    return d.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}


function formatCurrency(value) {

    return "₹ " + Number(value || 0).toFixed(2);

}


function showError(error) {

    console.error(error);

    alert(error.message || error);

}


/* =====================================================
   Refresh
===================================================== */

async function refreshPayments() {

    await loadMasters();

    await loadPayments();

}
