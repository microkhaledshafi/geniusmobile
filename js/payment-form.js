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
   Edit Mode
===================================================== */

const params = new URLSearchParams(window.location.search);

const paymentId = params.get("id");

const editMode = paymentId !== null;

/* =====================================================
   Default Date
===================================================== */

paymentDate.value = new Date().toISOString().split("T")[0];

/* =====================================================
   Cancel
===================================================== */

cancelBtn.addEventListener("click", () => {

    window.location.href = "payments.html";

});

/* =====================================================
   Load Parties
===================================================== */

partyType.addEventListener("change", loadParties);

async function loadParties() {

    partyId.innerHTML =
        `<option value="">Select Party</option>`;

    currentBalance.value = "";

    if (!partyType.value) return;

    let tableName = "";

    if (partyType.value === "Customer") {

        tableName = "customers";

    } else {

        tableName = "suppliers";

    }

    const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order("name");

    if (error) {

        alert(error.message);
        return;

    }

    data.forEach(row => {

        const option = document.createElement("option");

        option.value = row.id;
        option.textContent = row.name;

        partyId.appendChild(option);

    });

}

/* =====================================================
   Placeholder
===================================================== */

/* =====================================================
   Current Balance
===================================================== */

partyId.addEventListener("change", loadCurrentBalance);

async function loadCurrentBalance() {

    currentBalance.value = "";

    if (!partyType.value || !partyId.value)
        return;

    try {

        let balance = 0;

        /* -----------------------------
           Opening Balance
        ----------------------------- */

        const table =
            partyType.value === "Customer"
                ? "customers"
                : "suppliers";

        const { data: party } = await supabase
            .from(table)
            .select("opening_balance")
            .eq("id", partyId.value)
            .single();

        balance = Number(party?.opening_balance || 0);

        /* -----------------------------
           Customer Balance
        ----------------------------- */

        if (partyType.value === "Customer") {

            /* Sales */

            try {

                const { data: sales } = await supabase
                    .from("sales")
                    .select("grand_total")
                    .eq("customer_id", partyId.value);

                if (sales) {

                    sales.forEach(s => {

                        balance += Number(s.grand_total);

                    });

                }

            } catch (e) {}

            /* Payments Received */

            const { data: received } = await supabase
                .from("payments")
                .select("amount")
                .eq("party_type", "Customer")
                .eq("party_id", partyId.value)
                .eq("payment_type", "Receive");

            if (received) {

                received.forEach(r => {

                    balance -= Number(r.amount);

                });

            }

        }

        /* -----------------------------
           Supplier Balance
        ----------------------------- */

        else {

            /* Purchases */

            const { data: purchases } = await supabase
                .from("purchase_master")
                .select("grand_total,supplier_id")
                .eq("supplier_id", partyId.value);

            if (purchases) {

                purchases.forEach(p => {

                    balance += Number(p.grand_total);

                });

            }

            /* Payments Made */

            const { data: paid } = await supabase
                .from("payments")
                .select("amount")
                .eq("party_type", "Supplier")
                .eq("party_id", partyId.value)
                .eq("payment_type", "Pay");

            if (paid) {

                paid.forEach(p => {

                    balance -= Number(p.amount);

                });

            }

        }

        currentBalance.value =
            "₹ " + balance.toFixed(2);

    }

    catch (err) {

        console.error(err);

        currentBalance.value = "Unable to calculate";

    }

}
/* =====================================================
   Edit Mode
===================================================== */

if (editMode) {

    // Part 4
    // Load payment for editing.

}

/* =====================================================
   Save Payment
===================================================== */

form.addEventListener("submit", savePayment);

async function savePayment(e) {

    e.preventDefault();

    if (!partyType.value) {
        alert("Select Party Type");
        return;
    }

    if (!partyId.value) {
        alert("Select Party");
        return;
    }

    if (!paymentType.value) {
        alert("Select Payment Type");
        return;
    }

    if (!amount.value || Number(amount.value) <= 0) {
        alert("Enter a valid amount");
        return;
    }

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

    try {

        if (editMode) {

            const { error } = await supabase
                .from("payments")
                .update(payment)
                .eq("id", paymentId);

            if (error) throw error;

            alert("Payment updated successfully.");

        } else {

            const { error } = await supabase
                .from("payments")
                .insert(payment);

            if (error) throw error;

            alert("Payment saved successfully.");

        }

        window.location.href = "payments.html";

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

}

/* =====================================================
   Edit Mode
===================================================== */

if (editMode) {

    loadPayment();

}

async function loadPayment() {

    try {

        const { data, error } = await supabase
            .from("payments")
            .select("*")
            .eq("id", paymentId)
            .single();

        if (error) throw error;

        /* Party Type */

        partyType.value = data.party_type;

        /* Load Customer/Supplier List */

        await loadParties();

        /* Party */

        partyId.value = data.party_id;

        /* Payment */

        paymentType.value = data.payment_type;

        amount.value = data.amount;

        paymentDate.value = data.payment_date;

        paymentMode.value = data.payment_mode || "Cash";

        referenceNo.value = data.reference_no || "";

        remarks.value = data.remarks || "";

        /* Current Balance */

        await loadCurrentBalance();

    }

    catch (err) {

        console.error(err);

        alert("Unable to load payment.");

    }

}
