import { supabase } from "./supabase.js";

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

document.addEventListener("DOMContentLoaded", () => {

    loadPayments();

});


/* =====================================================
   Buttons
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

        if (error) throw error;

        payments = data || [];

        await loadPartyMaps();

        updateDashboard();

        renderPayments(payments);

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

/* =====================================================
   Load Customer & Supplier Maps
===================================================== */

async function loadPartyMaps() {

    customerMap = {};
    supplierMap = {};

    /* -----------------------------
       Customers
    ----------------------------- */

    const { data: customers, error: customerError } =
        await supabase
            .from("customers")
            .select("id,name");

    if (customerError) {

        console.error(customerError);

    } else {

        (customers || []).forEach(customer => {

            customerMap[customer.id] = customer.name;

        });

    }

    /* -----------------------------
       Suppliers
    ----------------------------- */

    const { data: suppliers, error: supplierError } =
        await supabase
            .from("suppliers")
            .select("id,name");

    if (supplierError) {

        console.error(supplierError);

    } else {

        (suppliers || []).forEach(supplier => {

            supplierMap[supplier.id] = supplier.name;

        });

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

        if (payment.payment_type === "Receive") {

            received += Number(payment.amount || 0);

        }

        if (payment.payment_type === "Pay") {

            paid += Number(payment.amount || 0);

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

    const keyword = searchPayment.value
        .trim()
        .toLowerCase();

    const type = filterPartyType.value;

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
   Render Payments
===================================================== */

function renderPayments(data) {

    paymentBody.innerHTML = "";

    if (!data.length) {

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

        paymentBody.innerHTML += `

<tr>

    <td>

        ${formatDate(payment.payment_date)}

    </td>

    <td>

        ${partyName}

    </td>

    <td>

        <span class="badge ${payment.party_type.toLowerCase()}">

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

    <td>

        ₹ ${Number(payment.amount).toFixed(2)}

    </td>

    <td>

        ${payment.payment_mode || "-"}

    </td>

    <td>

        ${payment.reference_no || "-"}

    </td>

    <td>

        ${payment.remarks || "-"}

    </td>

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

    const editBtn = e.target.closest(".edit-btn");

    if (editBtn) {

        window.location.href =
            `payment-form.html?id=${editBtn.dataset.id}`;

        return;

    }

    const deleteBtn = e.target.closest(".delete-btn");

    if (deleteBtn) {

        deleteId = deleteBtn.dataset.id;

        deleteModal.style.display = "flex";

    }

});

/* =====================================================
   Delete Payment
===================================================== */

async function deletePayment() {

    if (!deleteId)
        return;

    try {

        const { error } = await supabase

            .from("payments")

            .delete()

            .eq("id", deleteId);

        if (error)
            throw error;

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

function getPartyName(payment) {

    if (payment.party_type === "Customer") {

        return customerMap[payment.party_id] || "-";

    }

    if (payment.party_type === "Supplier") {

        return supplierMap[payment.party_id] || "-";

    }

    return "-";

}


function formatDate(date) {

    if (!date)
        return "-";

    return new Date(date).toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}

