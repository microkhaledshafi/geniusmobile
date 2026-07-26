/* ==========================================================
   Genius Scientific ERP
   calculations.js
   Part 1
   Invoice Calculation Engine
========================================================== */

import { getInvoiceItems } from "./invoiceTable.js";
import { updatePayment } from "./payment.js";

/* ==========================================================
   Constants
========================================================== */

const DECIMAL_PLACES = 2;

/* ==========================================================
   Module State
========================================================== */

const totals = {

    subTotal: 0,

    discount: 0,

    taxable: 0,

    gst: 0,

    grandTotal: 0

};

/* ==========================================================
   Number Helpers
========================================================== */

function toNumber(value) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}

function round(value) {

    return Number(

        toNumber(value)

            .toFixed(DECIMAL_PLACES)

    );

}

/* ==========================================================
   Totals Helpers
========================================================== */

function resetTotals() {

    totals.subTotal = 0;

    totals.discount = 0;

    totals.taxable = 0;

    totals.gst = 0;

    totals.grandTotal = 0;

}

function cloneTotals() {

    return {

        subTotal: totals.subTotal,

        discount: totals.discount,

        taxable: totals.taxable,

        gst: totals.gst,

        grandTotal: totals.grandTotal

    };

}

/* ==========================================================
   UI Helpers
========================================================== */

function setValue(id, value) {

    const element = document.getElementById(id);

    if (!element)
        return;

    if (

        element.tagName === "INPUT" ||

        element.tagName === "TEXTAREA"

    ) {

        element.value =

            round(value)

                .toFixed(DECIMAL_PLACES);

    }

    else {

        element.textContent =

            round(value)

                .toFixed(DECIMAL_PLACES);

    }

}

/* ==========================================================
   Row Helpers
========================================================== */

function getRowValues(row) {

    return {

        quantity: toNumber(

            row.querySelector(".qty")?.value

        ),

        rate: toNumber(

            row.querySelector(".rate")?.value

        ),

        discount: toNumber(

            row.querySelector(".discount")?.value

        ),

        gst: toNumber(

            row.querySelector(".gst")?.value

        )

    };

}

/* ==========================================================
   End Part 1
========================================================== */

/* ==========================================================
   Row Calculation Engine
========================================================== */

/**
 * Calculate a single invoice row.
 *
 * Formula:
 * Amount = Qty × Rate
 * Discount = Amount × Discount%
 * Taxable = Amount − Discount
 * GST = Taxable × GST%
 * Total = Taxable + GST
 */
function calculateRow(values = {}) {

    const quantity =
        toNumber(values.quantity);

    const rate =
        toNumber(values.rate);

    const discountPercent =
        toNumber(values.discount);

    const gstPercent =
        toNumber(values.gst);

    const amount =
        round(quantity * rate);

    const discountAmount =
        round(
            amount *
            discountPercent /
            100
        );

    const taxableAmount =
        round(
            amount -
            discountAmount
        );

    const gstAmount =
        round(
            taxableAmount *
            gstPercent /
            100
        );

    const lineTotal =
        round(
            taxableAmount +
            gstAmount
        );

    return {

        quantity,

        rate,

        discountPercent,

        gstPercent,

        amount,

        discountAmount,

        taxableAmount,

        gstAmount,

        lineTotal

    };

}

/* ==========================================================
   Update Row UI
========================================================== */

function updateRowUI(
    row,
    values
) {

    if (!row)
        return;

    const amountInput =
        row.querySelector(".amount");

    if (amountInput) {

        amountInput.value =
            values.lineTotal.toFixed(
                DECIMAL_PLACES
            );

    }

}

/* ==========================================================
   Recalculate One Row
========================================================== */

function recalculateSingleRow(row) {

    if (!row)
        return null;

    const values =
        calculateRow(

            getRowValues(row)

        );

    updateRowUI(

        row,

        values

    );

    return values;

}

/* ==========================================================
   Public Row Recalculation
========================================================== */

export function recalculateRow(row) {

    return recalculateSingleRow(row);

}

/* ==========================================================
   Utility
========================================================== */

export function calculateItem(item) {

    return calculateRow({

        quantity:
            item.quantity,

        rate:
            item.rate,

        discount:
            item.discount,

        gst:
            item.gst

    });

}

/* ==========================================================
   Invoice Totals Engine
========================================================== */

function calculateInvoiceTotals() {

    resetTotals();

    const items = getInvoiceItems();

    for (const item of items) {

        const values = calculateItem(item);

        totals.subTotal += values.amount;

        totals.discount += values.discountAmount;

        totals.taxable += values.taxableAmount;

        totals.gst += values.gstAmount;

        totals.grandTotal += values.lineTotal;

    }

    totals.subTotal =
        round(totals.subTotal);

    totals.discount =
        round(totals.discount);

    totals.taxable =
        round(totals.taxable);

    totals.gst =
        round(totals.gst);

    totals.grandTotal =
        round(totals.grandTotal);

}

/* ==========================================================
   Update Totals UI
========================================================== */

function updateTotalsUI() {

    setValue(

        "subTotal",

        totals.subTotal

    );

    setValue(

        "discountTotal",

        totals.discount

    );

    setValue(

        "taxTotal",

        totals.gst

    );

    setValue(

        "grandTotal",

        totals.grandTotal

    );

}

/* ==========================================================
   Refresh Invoice Totals
========================================================== */

export function refreshInvoiceTotals() {

    calculateInvoiceTotals();

    updateTotalsUI();

    updatePayment();

}

/* ==========================================================
   Get Current Totals
========================================================== */

export function getInvoiceTotals() {

    return cloneTotals();

}

/* ==========================================================
   Get Grand Total
========================================================== */

export function getGrandTotal() {

    return totals.grandTotal;

}

/* ==========================================================
   Get Tax Total
========================================================== */

export function getTaxTotal() {

    return totals.gst;

}

/* ==========================================================
   Get Discount Total
========================================================== */

export function getDiscountTotal() {

    return totals.discount;

}

/* ==========================================================
   Get Sub Total
========================================================== */

export function getSubTotal() {

    return totals.subTotal;

}

/* ==========================================================
   Initialize
========================================================== */

let initialized = false;

export function initializeCalculations() {

    if (initialized)
        return;

    resetTotals();

    updateTotalsUI();

    initialized = true;

    console.log(
        "[Calculations] Initialized"
    );

}

/* ==========================================================
   Clear Totals
========================================================== */

export function clearTotals() {

    resetTotals();

    updateTotalsUI();

    updatePayment();

}

/* ==========================================================
   Reset Module
========================================================== */

export function resetCalculations() {

    initialized = false;

    clearTotals();

}

/* ==========================================================
   Public Recalculate
========================================================== */

export function recalculateRow(row) {

    const result =
        recalculateSingleRow(row);

    refreshInvoiceTotals();

    return result;

}

/* ==========================================================
   Default Export
========================================================== */

export default {

    initializeCalculations,

    calculateItem,

    recalculateRow,

    refreshInvoiceTotals,

    getInvoiceTotals,

    getSubTotal,

    getDiscountTotal,

    getTaxTotal,

    getGrandTotal,

    clearTotals,

    resetCalculations

};
