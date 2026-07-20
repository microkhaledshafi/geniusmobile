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

/* =====================================================
   Variables
===================================================== */

let payments = [];
let customerMap = {};

let supplierMap = {};

/* =====================================================
   Initialize
===================================================== */

loadPayments();

/* =====================================================
   Buttons
===================================================== */

newPaymentBtn.addEventListener("click", () => {

    window.location.href = "payment-form.html";

});

/* =====================================================
   Load Payments
===================================================== */

async function loadPayments() {

    console.log("Payment Object");
console.log(payment);

alert(JSON.stringify(payment, null, 2));
   const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("payment_date", { ascending: false });

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    payments = data || [];

    updateDashboard();

    renderPayments(payments);

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

            received += Number(payment.amount);

        }

        if (payment.payment_type === "Pay") {

            paid += Number(payment.amount);

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

searchPayment.addEventListener("input", filterPayments);

filterPartyType.addEventListener("change", filterPayments);

function filterPayments() {

    const keyword = searchPayment.value.trim().toLowerCase();

    const type = filterPartyType.value;

    const filtered = payments.filter(payment => {

        const partyName = getPartyName(payment).toLowerCase();

        const reference = (payment.reference_no || "").toLowerCase();

        const remarks = (payment.remarks || "").toLowerCase();

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

async function renderPayments(data) {

    paymentBody.innerHTML = "";

    /* -----------------------------
       Load Customers
    ----------------------------- */

    const { data: customers } = await supabase
        .from("customers")
        .select("id,name");

    customerMap = {};

    (customers || []).forEach(c => {

        customerMap[c.id] = c.name;

    });

    /* -----------------------------
       Load Suppliers
    ----------------------------- */

    const { data: suppliers } = await supabase
        .from("suppliers")
        .select("id,name");

    supplierMap = {};

    (suppliers || []).forEach(s => {

        supplierMap[s.id] = s.name;

    });

    /* -----------------------------
       Empty
    ----------------------------- */

    if (!data.length) {

        paymentBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center">
                    No payments found
                </td>
            </tr>
        `;

        return;

    }

    /* -----------------------------
       Rows
    ----------------------------- */

    data.forEach(payment => {

        const partyName =
            payment.party_type === "Customer"
                ? customerMap[payment.party_id] || "-"
                : supplierMap[payment.party_id] || "-";

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
   Delete Modal
===================================================== */

const deleteModal = document.getElementById("deleteModal");

const cancelDelete = document.getElementById("cancelDelete");

const confirmDelete = document.getElementById("confirmDelete");

let deleteId = null;

/* =====================================================
   Table Actions
===================================================== */

paymentBody.addEventListener("click", (e) => {

    const editBtn = e.target.closest(".edit-btn");

    if (editBtn) {

        const id = editBtn.dataset.id;

        window.location.href =
            `payment-form.html?id=${id}`;

        return;

    }

    const deleteBtn = e.target.closest(".delete-btn");

    if (deleteBtn) {

        deleteId = deleteBtn.dataset.id;

        deleteModal.style.display = "flex";

    }

});

/* =====================================================
   Cancel Delete
===================================================== */

cancelDelete.addEventListener("click", () => {

    deleteModal.style.display = "none";

    deleteId = null;

});

/* =====================================================
   Close on Outside Click
===================================================== */

window.addEventListener("click", (e) => {

    if (e.target === deleteModal) {

        deleteModal.style.display = "none";

        deleteId = null;

    }

});

/* =====================================================
   Confirm Delete
===================================================== */

confirmDelete.addEventListener("click", deletePayment);

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

        loadPayments();

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

        return customerMap[payment.party_id] || "";

    }

    return supplierMap[payment.party_id] || "";

}

function formatDate(date) {

    return new Date(date).toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}

