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

const currentBalance = document.getElementById("currentBalance");

const cancelBtn = document.getElementById("cancelBtn");


/* =====================================================
   Variables
===================================================== */

const params = new URLSearchParams(window.location.search);

const paymentId = params.get("id");

const editMode = paymentId !== null;


/* =====================================================
   Initialize
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    paymentDate.value =
        new Date().toISOString().split("T")[0];

    if (editMode) {

        await loadPayment();

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

partyId.addEventListener("change", async () => {

    await loadCurrentBalance();

});

form.addEventListener("submit", savePayment);

/* =====================================================
   Load Parties
===================================================== */

async function loadParties() {

    partyId.innerHTML =
        '<option value="">Select Party</option>';

    currentBalance.value = "";

    if (!partyType.value)
        return;

    try {

       let table = "";

const nameColumn = "name";

if (partyType.value === "Customer") {

    table = "customers";

} else {

    table = "suppliers";

}
        const { data, error } = await supabase

            .from(table)

            .select(`id, ${nameColumn}`)

            .order(nameColumn);

        if (error)
            throw error;

        data.forEach(row => {

            const option =
                document.createElement("option");

            option.value = row.id;

            option.textContent =
                row[nameColumn];

            partyId.appendChild(option);

        });

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}


/* =====================================================
   Current Balance
===================================================== */

async function loadCurrentBalance() {

    currentBalance.value = "";

    if (!partyType.value || !partyId.value)
        return;

    try {

        let balance = 0;

        if (partyType.value === "Customer") {

            /* Opening Balance */

            const { data: customer } =
                await supabase

                    .from("customers")

                    .select("opening_balance")

                    .eq("id", partyId.value)

                    .single();

            balance =
                Number(customer?.opening_balance || 0);

            /* Sales */

            const { data: sales } =
                await supabase

                    .from("sales")

                    .select("grand_total")

                    .eq("customer_id", partyId.value);

            (sales || []).forEach(row => {

                balance += Number(row.grand_total);

            });

            /* Payments Received */

            const { data: received } =
                await supabase

                    .from("payments")

                    .select("amount")

                    .eq("party_type", "Customer")

                    .eq("party_id", partyId.value)

                    .eq("payment_type", "Receive");

            (received || []).forEach(row => {

                balance -= Number(row.amount);

            });

        }

        else {

            /* Opening Balance */

            const { data: supplier } =
                await supabase

                    .from("suppliers")

                    .select("opening_balance")

                    .eq("id", partyId.value)

                    .single();

            balance =
                Number(supplier?.opening_balance || 0);

            /* Purchases */

            const { data: purchases } =
                await supabase

                    .from("purchase_master")

                    .select("grand_total")

                    .eq("supplier_id", partyId.value);

            (purchases || []).forEach(row => {

                balance += Number(row.grand_total);

            });

            /* Payments Made */

            const { data: paid } =
                await supabase

                    .from("payments")

                    .select("amount")

                    .eq("party_type", "Supplier")

                    .eq("party_id", partyId.value)

                    .eq("payment_type", "Pay");

            (paid || []).forEach(row => {

                balance -= Number(row.amount);

            });

        }

        currentBalance.value =
            "₹ " + balance.toFixed(2);

    }

    catch (err) {

        console.error(err);

        currentBalance.value =
            "Unable to calculate";

    }

}

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
        alert("Please enter a valid Amount.");
        return;
    }

    try {

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

        if (editMode) {

            const { error } = await supabase

                .from("payments")

                .update(payment)

                .eq("id", paymentId);

            if (error)
                throw error;

            alert("Payment updated successfully.");

        }

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

        /* Payment Details */

        paymentType.value = data.payment_type;

        paymentDate.value = data.payment_date;

        amount.value = data.amount;

        paymentMode.value = data.payment_mode || "Cash";

        referenceNo.value = data.reference_no || "";

        remarks.value = data.remarks || "";

        /* Party */

        partyType.value = data.party_type;

        await loadParties();

        partyId.value = data.party_id;

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

    partyId.innerHTML =
        '<option value="">Select Party</option>';

    currentBalance.value = "";

}


/* =====================================================
   Helpers
===================================================== */

function formatCurrency(value) {

    return "₹ " + Number(value || 0).toFixed(2);

}

function showError(error) {

    console.error(error);

    alert(error.message || "Something went wrong.");

}


/* =====================================================
   Clear Form (Optional)
===================================================== */

function clearForm() {

    partyType.value = "";

    partyId.innerHTML =
        '<option value="">Select Party</option>';

    paymentType.value = "";

    paymentMode.value = "Cash";

    amount.value = "";

    referenceNo.value = "";

    remarks.value = "";

    currentBalance.value = "";

    paymentDate.value =
        new Date().toISOString().split("T")[0];

}
