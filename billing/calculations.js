/*
==========================================================
Genius Scientific ERP
Billing Module

File:
calculations.js

Purpose:
Invoice calculation engine.

Responsibilities

• Calculate invoice rows
• Calculate invoice totals
• Update totals state
• Register calculation events
• Expose calculation API

==========================================================
*/

/*==========================================================
Imports
==========================================================*/

import {

    getInvoiceItems

} from "./invoiceTable.js";

/*==========================================================
Constants
==========================================================*/

const DECIMAL_PLACES = 2;

/*==========================================================
Module State
==========================================================*/

let invoiceTotals = {

    subtotal: 0,

    discount: 0,

    taxable: 0,

    gst: 0,

    grandTotal: 0

};

/*==========================================================
Private Helper Functions
==========================================================*/

/**
 * Safely convert any value into a number.
 *
 * @param {*} value
 * @returns {number}
 */
function parseNumber(value) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}

/**
 * Round a number using the configured precision.
 *
 * @param {number} value
 * @returns {number}
 */
function roundValue(value) {

    return Number(
        parseNumber(value).toFixed(
            DECIMAL_PLACES
        )
    );

}

/**
 * Reset invoice totals.
 */
function resetTotals() {

    invoiceTotals.subtotal = 0;

    invoiceTotals.discount = 0;

    invoiceTotals.taxable = 0;

    invoiceTotals.gst = 0;

    invoiceTotals.grandTotal = 0;

}

/**
 * Clone totals object.
 *
 * Prevents external modules from
 * modifying internal state.
 *
 * @returns {Object}
 */
function cloneTotals() {

    return {

        subtotal: invoiceTotals.subtotal,

        discount: invoiceTotals.discount,

        taxable: invoiceTotals.taxable,

        gst: invoiceTotals.gst,

        grandTotal: invoiceTotals.grandTotal

    };

}

/*==========================================================
End of Part 1
==========================================================*/
/*==========================================================
Row Calculation Engine
==========================================================*/

/**
 * Calculate a single invoice row.
 *
 * Formula
 *
 * Amount = Qty × Rate
 * Discount = Amount × Discount% / 100
 * Taxable = Amount − Discount
 * GST = Taxable × GST% / 100
 * Total = Taxable + GST
 *
 * @param {Object} item
 * @returns {Object}
 */
function calculateRow(item = {}) {

    const quantity =
        parseNumber(item.quantity);

    const rate =
        parseNumber(item.rate);

    const discountPercent =
        parseNumber(item.discount);

    const gstPercent =
        parseNumber(item.gst);

    const amount =
        roundValue(
            quantity * rate
        );

    const discountAmount =
        roundValue(
            amount *
            discountPercent /
            100
        );

    const taxableAmount =
        roundValue(
            amount -
            discountAmount
        );

    const gstAmount =
        roundValue(
            taxableAmount *
            gstPercent /
            100
        );

    const lineTotal =
        roundValue(
            taxableAmount +
            gstAmount
        );

    return {

        quantity,

        rate,

        discount: discountPercent,

        gst: gstPercent,

        amount,

        discountAmount,

        taxableAmount,

        gstAmount,

        total: lineTotal

    };

}

/**
 * Update calculated values
 * inside a table row.
 *
 * @param {HTMLTableRowElement} row
 * @param {Object} values
 */
function updateRowUI(
    row,
    values
) {

    if (!row) {

        return;

    }

    const amountCell =
        row.querySelector(".amount");

    const taxCell =
        row.querySelector(".tax");

    const totalCell =
        row.querySelector(".total");

    if (amountCell) {

        amountCell.textContent =
            values.amount.toFixed(
                DECIMAL_PLACES
            );

    }

    if (taxCell) {

        taxCell.textContent =
            values.gstAmount.toFixed(
                DECIMAL_PLACES
            );

    }

    if (totalCell) {

        totalCell.textContent =
            values.total.toFixed(
                DECIMAL_PLACES
            );

    }

}

/**
 * Recalculate one row.
 *
 * @param {HTMLTableRowElement} row
 */
function recalculateSingleRow(
    row
) {

    if (!row) {

        return null;

    }

    const values =
        calculateRow({

            quantity:
                row.querySelector(".quantity")?.value,

            rate:
                row.querySelector(".rate")?.value,

            discount:
                row.querySelector(".discount")?.value,

            gst:
                row.querySelector(".gst")?.value

        });

    updateRowUI(
        row,
        values
    );

    return values;

}
/*==========================================================
Invoice Totals Engine
==========================================================*/

/**
 * Calculate complete invoice totals.
 */
function calculateInvoiceTotals() {

    resetTotals();

    const items = getInvoiceItems();

    for (const item of items) {

        const values = calculateRow(item);

        invoiceTotals.subtotal += values.amount;

        invoiceTotals.discount += values.discountAmount;

        invoiceTotals.taxable += values.taxableAmount;

        invoiceTotals.gst += values.gstAmount;

        invoiceTotals.grandTotal += values.total;

    }

    invoiceTotals.subtotal =
        roundValue(invoiceTotals.subtotal);

    invoiceTotals.discount =
        roundValue(invoiceTotals.discount);

    invoiceTotals.taxable =
        roundValue(invoiceTotals.taxable);

    invoiceTotals.gst =
        roundValue(invoiceTotals.gst);

    invoiceTotals.grandTotal =
        roundValue(invoiceTotals.grandTotal);

}

/**
 * Update invoice totals on screen.
 */
function updateTotalsUI() {

    const subtotalElement =
        document.getElementById("subtotal");

    const discountElement =
        document.getElementById("discountTotal");

    const taxableElement =
        document.getElementById("taxableAmount");

    const gstElement =
        document.getElementById("gstTotal");

    const grandTotalElement =
        document.getElementById("grandTotal");

    if (subtotalElement) {

        subtotalElement.textContent =
            invoiceTotals.subtotal.toFixed(
                DECIMAL_PLACES
            );

    }

    if (discountElement) {

        discountElement.textContent =
            invoiceTotals.discount.toFixed(
                DECIMAL_PLACES
            );

    }

    if (taxableElement) {

        taxableElement.textContent =
            invoiceTotals.taxable.toFixed(
                DECIMAL_PLACES
            );

    }

    if (gstElement) {

        gstElement.textContent =
            invoiceTotals.gst.toFixed(
                DECIMAL_PLACES
            );

    }

    if (grandTotalElement) {

        grandTotalElement.textContent =
            invoiceTotals.grandTotal.toFixed(
                DECIMAL_PLACES
            );

    }

}

/**
 * Recalculate the entire invoice.
 */
function refreshInvoiceCalculations() {

    const rows =
        document.querySelectorAll(
            "#invoiceItemsBody tr"
        );

    rows.forEach((row) => {

        recalculateSingleRow(row);

    });

    calculateInvoiceTotals();

    updateTotalsUI();

}
/*==========================================================
Event Registration
==========================================================*/

/**
 * Register calculation events.
 */
function registerCalculationEvents() {

    const tableBody =
        document.getElementById(
            "invoiceItemsBody"
        );

    if (!tableBody) {

        return;

    }

    tableBody.addEventListener(
        "input",
        (event) => {

            const target =
                event.target;

            if (!(target instanceof HTMLElement)) {

                return;

            }

            if (

                target.classList.contains("quantity") ||

                target.classList.contains("rate") ||

                target.classList.contains("discount") ||

                target.classList.contains("gst")

            ) {

                const row =
                    target.closest("tr");

                if (!row) {

                    return;

                }

                recalculateSingleRow(
                    row
                );

                calculateInvoiceTotals();

                updateTotalsUI();

            }

        }

    );

}

/*==========================================================
Public API
==========================================================*/

/**
 * Initialize calculation module.
 */
export function initCalculations() {

    registerCalculationEvents();

    refreshInvoiceCalculations();

    console.log(
        "[Calculations] Module initialized."
    );

}

/**
 * Recalculate one row.
 *
 * @param {HTMLTableRowElement} row
 */
export function recalculateRow(
    row
) {

    recalculateSingleRow(
        row
    );

    calculateInvoiceTotals();

    updateTotalsUI();

}

/**
 * Recalculate complete invoice.
 */
export function recalculateInvoice() {

    refreshInvoiceCalculations();

}

/**
 * Return current totals.
 *
 * @returns {Object}
 */
export function getInvoiceTotals() {

    return cloneTotals();

}

/**
 * Clear invoice totals.
 */
export function clearTotals() {

    resetTotals();

    updateTotalsUI();

}
