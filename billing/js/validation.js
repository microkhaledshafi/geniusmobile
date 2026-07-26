/* ==========================================================
   Genius Scientific ERP
   validation.js
   Part 1
========================================================== */

import { state } from "./state.js";

let initialized = false;

/* ==========================================================
   Initialize
========================================================== */

export function initializeValidation() {

    if (initialized)
        return;

    initialized = true;

    console.log(

        "[Validation] Initialized"

    );

}

/* ==========================================================
   Validate Invoice
========================================================== */

export function validateInvoice() {

    if (!validateCustomer())
        return false;

    if (!validateItems())
        return false;

    if (!validateTotals())
        return false;

    return true;

}

/* ==========================================================
   Validate Customer
========================================================== */

export function validateCustomer() {

    const customer = state.customer;

    if (!customer)
        return false;

    if (!customer.name)
        return false;

    return true;

}

/* ==========================================================
   Validate Items
========================================================== */

export function validateItems() {

    const items = state.invoiceItems || [];

    if (!items.length)
        return false;

    return true;

}

/* ==========================================================
   Validate Totals
========================================================== */

export function validateTotals() {

    const totals = state.totals || {};

    if (Number(totals.grandTotal || 0) <= 0)
        return false;

    return true;

}

/* ==========================================================
   Validate Payment
========================================================== */

export function validatePayment() {

    const payment = state.payment || {};

    if (!payment.mode)
        return false;

    if (!payment.status)
        return false;

    return true;

}

/* ==========================================================
   Validate Item
========================================================== */

export function validateItem(item) {

    if (!item)
        return false;

    if (!item.productId)
        return false;

    if (!validateQuantity(item.quantity))
        return false;

    if (!validateRate(item.rate))
        return false;

    return true;

}

/* ==========================================================
   Validate Quantity
========================================================== */

export function validateQuantity(quantity) {

    quantity = Number(quantity);

    if (Number.isNaN(quantity))
        return false;

    if (quantity <= 0)
        return false;

    return true;

}

/* ==========================================================
   Validate Rate
========================================================== */

export function validateRate(rate) {

    rate = Number(rate);

    if (Number.isNaN(rate))
        return false;

    if (rate < 0)
        return false;

    return true;

}

/* ==========================================================
   Reset Validation
========================================================== */

export function resetValidation() {

    return true;

}

/* ==========================================================
   Destroy Validation
========================================================== */

export function destroyValidation() {

    initialized = false;

}

/* ==========================================================
   Validation Status
========================================================== */

export function isValidationInitialized() {

    return initialized;

}

/* ==========================================================
   Default Export
========================================================== */

export default {

    initializeValidation,

    validateInvoice,

    validateCustomer,

    validateItems,

    validateTotals,

    validatePayment,

    validateItem,

    validateQuantity,

    validateRate,

    resetValidation,

    destroyValidation,

    isValidationInitialized

};
