/* ==========================================================
   Genius Scientific ERP
   payment.js
   Part 1
   Payment Module
========================================================== */

import { state } from "./state.js";
import { qs } from "./utils.js";

let initialized = false;

let paymentMode = null;
let paymentStatus = null;
let amountReceived = null;
let amountPayable = null;
let balanceAmount = null;
let changeAmount = null;

/* ==========================================================
   Initialize
========================================================== */

export function initializePayment() {

    if (initialized) return;

    initialized = true;

    cacheElements();

    registerPaymentEvents();

    resetPayment();

    console.log("[Payment] Initialized");

}

/* ==========================================================
   Cache Elements
========================================================== */

function cacheElements() {

    paymentMode = qs("#paymentMode");

    paymentStatus = qs("#paymentStatus");

    amountReceived = qs("#amountReceived");

    amountPayable = qs("#amountPayable");

    balanceAmount = qs("#balanceAmount");

    changeAmount = qs("#changeAmount");

}

/* ==========================================================
   Register Events
========================================================== */

function registerPaymentEvents() {

paymentMode?.addEventListener(
    "change",
    onPaymentModeChanged
);

paymentStatus?.addEventListener(
    "change",
    onPaymentStatusChanged
);
    amountReceived?.addEventListener(
        "input",
        onAmountReceivedChanged
    );

}

/* ==========================================================
   Amount Received Changed
========================================================== */

function onAmountReceivedChanged() {

    updatePayment();

}

/* ==========================================================
   Payment Getters
========================================================== */

export function getPaymentMode() {

    return paymentMode?.value || "Cash";

}

export function getPaymentStatus() {

    return paymentStatus?.value || "Paid";

}

export function getAmountReceived() {

    return Number(
        amountReceived?.value || 0
    );

}

export function getAmountPayable() {

    return Number(
        amountPayable?.value || 0
    );

}

export function getBalanceAmount() {

    return Number(
        balanceAmount?.value || 0
    );

}

export function getChangeAmount() {

    return Number(
        changeAmount?.value || 0
    );

}

/* ==========================================================
   Payment Setters
========================================================== */

export function setPaymentMode(value) {

    if (paymentMode)
        paymentMode.value = value;

}

export function setPaymentStatus(value) {

    if (paymentStatus)
        paymentStatus.value = value;

}

export function setAmountReceived(value) {

    if (amountReceived)
        amountReceived.value = Number(value || 0).toFixed(2);

}

export function setAmountPayable(value) {

    if (amountPayable)
        amountPayable.value = Number(value || 0).toFixed(2);

}

export function setBalanceAmount(value) {

    if (balanceAmount)
        balanceAmount.value = Number(value || 0).toFixed(2);

}

export function setChangeAmount(value) {

    if (changeAmount)
        changeAmount.value = Number(value || 0).toFixed(2);

}

/* ==========================================================
   Payment Calculation Engine
========================================================== */

/**
 * Update payment values after invoice calculation.
 *
 * @param {Object} totals
 */
export function updatePayment(totals = null) {

    let grandTotal = 0;

    if (totals) {

        grandTotal = Number(
            totals.grandTotal || 0
        );

    } else if (state.totals) {

        grandTotal = Number(
            state.totals.grandTotal || 0
        );

    }

    setAmountPayable(grandTotal);

    const received =
        getAmountReceived();

    let balance = 0;
    let change = 0;

    if (received >= grandTotal) {

        change = received - grandTotal;

        balance = 0;

        setPaymentStatus("Paid");

    } else {

        balance = grandTotal - received;

        change = 0;

        if (received === 0) {

            setPaymentStatus("Pending");

        } else {

            setPaymentStatus("Partial");

        }

    }

    setBalanceAmount(balance);

    setChangeAmount(change);

    syncPaymentState();

}

/* ==========================================================
   Manual Status Changed
========================================================== */

function onPaymentStatusChanged() {

    syncPaymentState();

}

/* ==========================================================
   Manual Mode Changed
========================================================== */

function onPaymentModeChanged() {

    syncPaymentState();

}

/* ==========================================================
   Sync Payment To State
========================================================== */

function syncPaymentState() {

    state.payment = {

        mode: getPaymentMode(),

        status: getPaymentStatus(),

        amountReceived:
            getAmountReceived(),

        amountPayable:
            getAmountPayable(),

        balance:
            getBalanceAmount(),

        change:
            getChangeAmount()

    };

}

/* ==========================================================
   Update Payment UI From State
========================================================== */

export function loadPayment(payment = {}) {

    setPaymentMode(
        payment.mode || "Cash"
    );

    setPaymentStatus(
        payment.status || "Pending"
    );

    setAmountReceived(
        payment.amountReceived || 0
    );

    setAmountPayable(
        payment.amountPayable || 0
    );

    setBalanceAmount(
        payment.balance || 0
    );

    setChangeAmount(
        payment.change || 0
    );

}

/* ==========================================================
   Payment Validation
========================================================== */

export function validatePayment() {

    if (!paymentMode)
        return false;

    if (!paymentStatus)
        return false;

    return true;

}

/* ==========================================================
   Reset Payment
========================================================== */

export function resetPayment() {

    setPaymentMode("Cash");

    setPaymentStatus("Pending");

    setAmountReceived(0);

    setAmountPayable(0);

    setBalanceAmount(0);

    setChangeAmount(0);

    syncPaymentState();

}

/* ==========================================================
   Clear Payment
========================================================== */

export function clearPayment() {

    resetPayment();

}

/* ==========================================================
   Get Payment Object
========================================================== */

export function getPayment() {

    return {

        mode: getPaymentMode(),

        status: getPaymentStatus(),

        amountReceived: getAmountReceived(),

        amountPayable: getAmountPayable(),

        balance: getBalanceAmount(),

        change: getChangeAmount()

    };

}

/* ==========================================================
   Refresh Payment
========================================================== */

export function refreshPayment() {

    updatePayment();

}

/* ==========================================================
   Save Payment To State
========================================================== */

export function savePaymentState() {

    syncPaymentState();

}

/* ==========================================================
   Restore Payment From State
========================================================== */

export function restorePaymentState() {

    if (!state.payment)
        return;

    loadPayment(state.payment);

}

/* ==========================================================
   Destroy Payment Module
========================================================== */

export function destroyPayment() {

    resetPayment();

}

/* ==========================================================
   Public API
========================================================== */

export default {

    initializePayment,

    updatePayment,

    resetPayment,

    clearPayment,

    refreshPayment,

    getPayment,

    loadPayment,

    savePaymentState,

    restorePaymentState,

    validatePayment,

    getPaymentMode,
    getPaymentStatus,

    getAmountReceived,
    getAmountPayable,

    getBalanceAmount,
    getChangeAmount,

    setPaymentMode,
    setPaymentStatus,

    setAmountReceived,
    setAmountPayable,

    setBalanceAmount,
    setChangeAmount,

    destroyPayment

};

