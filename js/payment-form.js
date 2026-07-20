import { supabase } from "./supabase.js";

/* =====================================================
   Elements
===================================================== */

const form = document.getElementById("paymentForm");

const partyType = document.getElementById("partyType");

const partyId = document.getElementById("partyId");

const paymentType = document.getElementById("paymentType");

const paymentDate = document.getElementById("paymentDate");

const paymentMode = document.getElementById("paymentMode");

const amount = document.getElementById("amount");

const referenceNo = document.getElementById("referenceNo");

const remarks = document.getElementById("remarks");

const currentBalance =
    document.getElementById("currentBalance");

const cancelBtn =
    document.getElementById("cancelBtn");


/* =====================================================
   Variables
===================================================== */

const params =
    new URLSearchParams(window.location.search);

const paymentId = params.get("id");

const editMode = paymentId !== null;


/* =====================================================
   Initialize
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    paymentDate.value =
        new Date().toISOString().split("T")[0];

    if (editMode) {

        loadPayment();

    }

});


/* =====================================================
   Events
===================================================== */

cancelBtn.addEventListener("click", () => {

    window.location.href = "payments.html";

});

partyType.addEventListener("change", async () => {

    await loadParties();

});

partyId.addEventListener("change", () => {

    loadCurrentBalance();

});

form.addEventListener("submit", savePayment);

import { supabase } from "./supabase.js";

/* =====================================================
   Elements
===================================================== */

const form = document.getElementById("paymentForm");

const partyType = document.getElementById("partyType");

const partyId = document.getElementById("partyId");

const paymentType = document.getElementById("paymentType");

const paymentDate = document.getElementById("paymentDate");

const paymentMode = document.getElementById("paymentMode");

const amount = document.getElementById("amount");

const referenceNo = document.getElementById("referenceNo");

const remarks = document.getElementById("remarks");

const currentBalance =
    document.getElementById("currentBalance");

const cancelBtn =
    document.getElementById("cancelBtn");


/* =====================================================
   Variables
===================================================== */

const params =
    new URLSearchParams(window.location.search);

const paymentId = params.get("id");

const editMode = paymentId !== null;


/* =====================================================
   Initialize
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    paymentDate.value =
        new Date().toISOString().split("T")[0];

    if (editMode) {

        loadPayment();

    }

});


/* =====================================================
   Events
===================================================== */

cancelBtn.addEventListener("click", () => {

    window.location.href = "payments.html";

});

partyType.addEventListener("change", async () => {

    await loadParties();

});

partyId.addEventListener("change", () => {

    loadCurrentBalance();

});

form.addEventListener("submit", savePayment);

/* =====================================================
   Save Payment
===================================================== */

async function savePayment(e) {

    e.preventDefault();

    if (!partyType.value) {
        alert("Please select Party Type.");
        return;
    }

    if (!partyId.value) {
        alert("Please select Party.");
        return;
    }

    if (!paymentType.value) {
        alert("Please select Payment Type.");
        return;
    }

    if (!paymentDate.value) {
        alert("Please select Payment Date.");
        return;
    }

    if (!amount.value || Number(amount.value) <= 0) {
        alert("Enter a valid Amount.");
        return;
    }

    try {

        /* ----------------------------------------
           Verify Login Session
        ---------------------------------------- */

        const {
            data: { session }
        } = await supabase.auth.getSession();

        if (!session) {

            alert("Your login session has expired.");

            window.location.href = "../login.html";

            return;

        }

        /* ----------------------------------------
           Payment Object
        ---------------------------------------- */

        const payment = {

            payment_date: paymentDate.value,

            party_type: partyType.value,

            party_id: Number(partyId.value),

            payment_type: paymentType.value,

            amount: Number(amount.value),

            payment_mode: paymentMode.value,

            reference_no: referenceNo.value.trim(),

            remarks: remarks.value.trim()

        };

        /* ----------------------------------------
           Edit
        ---------------------------------------- */

        if (editMode) {

            const { error } = await supabase

                .from("payments")

                .update(payment)

                .eq("id", paymentId);

            if (error)
                throw error;

            alert("Payment updated successfully.");

        }

        /* ----------------------------------------
           New Payment
        ---------------------------------------- */

        else {

            const { error } = await supabase

                .from("payments")

                .insert(payment);

            if (error)
                throw error;

            alert("Payment saved successfully.");

        }

        window.location.href = "payments.html";

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

/* =====================================================
   Load Payment (Edit Mode)
===================================================== */

async function loadPayment() {

    try {

        const { data, error } = await supabase

            .from("payments")

            .select("*")

            .eq("id", paymentId)

            .single();

        if (error)
            throw error;

        /* -----------------------------
           Party Type
        ----------------------------- */

        partyType.value = data.party_type;

        await loadParties();

        /* -----------------------------
           Party
        ----------------------------- */

        partyId.value = data.party_id;

        /* -----------------------------
           Payment Details
        ----------------------------- */

        paymentType.value = data.payment_type;

        paymentDate.value = data.payment_date;

        amount.value = data.amount;

        paymentMode.value = data.payment_mode || "Cash";

        referenceNo.value = data.reference_no || "";

        remarks.value = data.remarks || "";

        await loadCurrentBalance();

    }

    catch (err) {

        console.error(err);

        alert("Unable to load payment.");

    }

}


/* =====================================================
   Reset Form
===================================================== */

function resetForm() {

    form.reset();

    paymentDate.value =
        new Date().toISOString().split("T")[0];

    currentBalance.value = "";

    partyId.innerHTML =
        `<option value="">Select Party</option>`;

}


/* =====================================================
   Helpers
===================================================== */

function formatCurrency(value) {

    return "₹ " + Number(value || 0).toFixed(2);

}

function showError(error) {

    console.error(error);

    alert(error.message || error);

}
