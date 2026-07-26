/* ==========================================================
   Genius Scientific ERP
   payment.js
   Part 1
   Payment Engine
========================================================== */

import {

    getGrandTotal

} from "./calculations.js";

/* ==========================================================
   Constants
========================================================== */

const PAYMENT_STATUS = {

    PAID: "Paid",

    PARTIAL: "Partial",

    PENDING: "Pending",

    EXCESS: "Excess"

};

/* ==========================================================
   Module State
========================================================== */

const paymentState = {

    paymentMode: "Cash",

    amountPayable: 0,

    amountReceived: 0,

    balanceAmount: 0,

    changeAmount: 0,

    paymentStatus: PAYMENT_STATUS.PENDING

};

let initialized = false;

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

            .toFixed(2)

    );

}

/* ==========================================================
   UI Helper
========================================================== */

function setValue(id, value) {

    const element =

        document.getElementById(id);

    if (!element)
        return;

    if (

        element.tagName === "INPUT" ||

        element.tagName === "SELECT" ||

        element.tagName === "TEXTAREA"

    ) {

        element.value = value;

    }

    else {

        element.textContent = value;

    }

}

/* ==========================================================
   Read UI Values
========================================================== */

function readPaymentMode() {

    return (

        document.getElementById("paymentMode")

            ?.value ||

        "Cash"

    );

}

function readReceivedAmount() {

    return round(

        document.getElementById("amountReceived")

            ?.value

    );

}

/* ==========================================================
   End Part 1
========================================================== */

/* ==========================================================
   Payment Calculation Engine
========================================================== */

function calculatePayment() {

    paymentState.amountPayable =

        round(

            getGrandTotal()

        );

    paymentState.amountReceived =

        round(

            readReceivedAmount()

        );

    if (!paymentState.paymentMode) {

    paymentState.paymentMode =
        readPaymentMode();

}

    const difference =

        round(

            paymentState.amountReceived -

            paymentState.amountPayable

        );

    if (difference >= 0) {

        paymentState.changeAmount =

            difference;

        paymentState.balanceAmount = 0;

    }

    else {

        paymentState.balanceAmount =

            Math.abs(difference);

        paymentState.changeAmount = 0;

    }

    determinePaymentStatus();

}

/* ==========================================================
   Payment Status
========================================================== */

function determinePaymentStatus() {

    if (paymentState.amountPayable <= 0) {

        paymentState.paymentStatus =

            PAYMENT_STATUS.PENDING;

        return;

    }

    if (

        paymentState.amountReceived === 0

    ) {

        paymentState.paymentStatus =

            PAYMENT_STATUS.PENDING;

        return;

    }

    if (

        paymentState.amountReceived <

        paymentState.amountPayable

    ) {

        paymentState.paymentStatus =

            PAYMENT_STATUS.PARTIAL;

        return;

    }

    if (

        paymentState.amountReceived ===

        paymentState.amountPayable

    ) {

        paymentState.paymentStatus =

            PAYMENT_STATUS.PAID;

        return;

    }

    paymentState.paymentStatus =

        PAYMENT_STATUS.EXCESS;

}

/* ==========================================================
   Update Payment
========================================================== */

export function updatePayment() {

    calculatePayment();

    updatePaymentUI();

}

/* ==========================================================
   Public Helper
========================================================== */

export function getPaymentState() {

    return {

        ...paymentState

    };

}

/* ==========================================================
   Update Payment UI
========================================================== */

function updatePaymentUI() {

    setValue(

        "paymentMode",

        paymentState.paymentMode

    );

    setValue(

        "amountPayable",

        paymentState.amountPayable.toFixed(2)

    );

    setValue(

        "amountReceived",

        paymentState.amountReceived.toFixed(2)

    );

    setValue(

        "balanceAmount",

        paymentState.balanceAmount.toFixed(2)

    );

    setValue(

        "changeAmount",

        paymentState.changeAmount.toFixed(2)

    );

    setValue(

        "paymentStatus",

        paymentState.paymentStatus

    );

}

/* ==========================================================
   Refresh UI From Current State
========================================================== */

export function refreshPaymentUI() {

    updatePaymentUI();

}

/* ==========================================================
   Register Events
========================================================== */

function registerPaymentEvents() {

    const receivedInput =

        document.getElementById(

            "amountReceived"

        );

    const paymentMode =

        document.getElementById(

            "paymentMode"

        );

    receivedInput?.addEventListener(

        "input",

        () => {

            updatePayment();

        }

    );

    paymentMode?.addEventListener(

        "change",

        () => {

            paymentState.paymentMode =

                paymentMode.value;

            updatePayment();

        }

    );

}

/* ==========================================================
   Set Payment Mode
========================================================== */

export function setPaymentMode(mode) {

    paymentState.paymentMode =

        mode;

    updatePayment();

}

/* ==========================================================
   Initialize
========================================================== */

export function initializePayment() {

    if (initialized)
        return;

    registerPaymentEvents();

    updatePayment();

    initialized = true;

    console.log(
        "[Payment] Initialized"
    );

}

/* ==========================================================
   Clear Payment
========================================================== */

export functionclearPayment() {

    paymentState.paymentMode = "Cash";

    paymentState.amountReceived = 0;

    updatePayment();

}

/* ==========================================================
   Validation
========================================================== */

export function validatePayment() {

    updatePayment();

    return {

        valid:

            paymentState.amountPayable >= 0 &&

            paymentState.amountReceived >= 0,

        paymentStatus:

            paymentState.paymentStatus,

        balanceAmount:

            paymentState.balanceAmount,

        changeAmount:

            paymentState.changeAmount

    };

}

/* ==========================================================
   Reset Module
========================================================== */

export function resetPayment() {

    initialized = false;

    clearPayment();

}

/* ==========================================================
   Default Export
========================================================== */

export default {

    initializePayment,

    updatePayment,

    refreshPayment,

    refreshPaymentUI,

    clearPayment,

    resetPayment,

    validatePayment,

    getPaymentState,

    setPaymentMode,

    setReceivedAmount

};

/* ==========================================================
   Set Received Amount
========================================================== */

export function setReceivedAmount(amount) {

    paymentState.amountReceived =

        round(amount);

    updatePayment();

}

/* ==========================================================
   Refresh From Invoice
========================================================== */

export function refreshPayment() {

    updatePayment();

}

