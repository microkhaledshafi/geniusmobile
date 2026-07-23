/*
==========================================================
Genius Scientific ERP
Billing Module

File:
payment.js

Purpose:
Invoice payment management.

Responsibilities

• Manage payment details
• Calculate balance/change
• Validate payment
• Expose payment API

==========================================================
*/

/*==========================================================
Imports
==========================================================*/

import {

    getInvoiceTotals

} from "./calculations.js";

/*==========================================================
Constants
==========================================================*/

const DECIMAL_PLACES = 2;

/*==========================================================
Module State
==========================================================*/

let paymentState = {

    paymentMode: "Cash",

    amountReceived: 0,

    amountPayable: 0,

    balance: 0,

    change: 0

};

/*==========================================================
Private Helper Functions
==========================================================*/

/**
 * Safely convert a value to number.
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
 * Round decimal value.
 *
 * @param {number} value
 * @returns {number}
 */
function roundValue(value) {

    return Number(

        parseNumber(value)

            .toFixed(

                DECIMAL_PLACES

            )

    );

}

/**
 * Reset payment state.
 */
function resetPaymentState() {

    paymentState.paymentMode = "Cash";

    paymentState.amountReceived = 0;

    paymentState.amountPayable = 0;

    paymentState.balance = 0;

    paymentState.change = 0;

}

/**
 * Return cloned payment state.
 *
 * Prevent external modification.
 *
 * @returns {Object}
 */
function clonePaymentState() {

    return {

        paymentMode:

            paymentState.paymentMode,

        amountReceived:

            paymentState.amountReceived,

        amountPayable:

            paymentState.amountPayable,

        balance:

            paymentState.balance,

        change:

            paymentState.change

    };

}

/*==========================================================
End of Part 1
==========================================================*/
/*==========================================================
Payment Calculation Engine
==========================================================*/

/**
 * Update amount payable
 * from invoice totals.
 */
function updateAmountPayable() {

    const totals = getInvoiceTotals();

    paymentState.amountPayable =

        roundValue(

            totals.grandTotal

        );

}

/**
 * Calculate payment values.
 *
 * Balance =
 * Amount Payable − Amount Received
 *
 * Change =
 * Amount Received − Amount Payable
 */
function calculatePayment() {

    updateAmountPayable();

    const payable =

        paymentState.amountPayable;

    const received =

        paymentState.amountReceived;

    if (

        received >= payable

    ) {

        paymentState.change =

            roundValue(

                received - payable

            );

        paymentState.balance = 0;

    }

    else {

        paymentState.balance =

            roundValue(

                payable - received

            );

        paymentState.change = 0;

    }

}

/**
 * Update payment screen.
 */
function updatePaymentUI() {

    const payableElement =

        document.getElementById(

            "amountPayable"

        );

    const receivedElement =

        document.getElementById(

            "amountReceived"

        );

    const balanceElement =

        document.getElementById(

            "balanceAmount"

        );

    const changeElement =

        document.getElementById(

            "changeAmount"

        );

    const paymentModeElement =

        document.getElementById(

            "paymentMode"

        );

    if (

        payableElement

    ) {

        payableElement.textContent =

            paymentState.amountPayable

                .toFixed(

                    DECIMAL_PLACES

                );

    }

    if (

        receivedElement

    ) {

        receivedElement.value =

            paymentState.amountReceived

                .toFixed(

                    DECIMAL_PLACES

                );

    }

    if (

        balanceElement

    ) {

        balanceElement.textContent =

            paymentState.balance

                .toFixed(

                    DECIMAL_PLACES

                );

    }

    if (

        changeElement

    ) {

        changeElement.textContent =

            paymentState.change

                .toFixed(

                    DECIMAL_PLACES

                );

    }

    if (

        paymentModeElement

    ) {

        paymentModeElement.value =

            paymentState.paymentMode;

    }

}

/**
 * Refresh payment.
 */
function refreshPayment() {

    calculatePayment();

    updatePaymentUI();

}
