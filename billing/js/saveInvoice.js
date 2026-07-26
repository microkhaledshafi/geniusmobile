/* ==========================================================
   Genius Scientific ERP
   saveInvoice.js
   Part 1
========================================================== */

import {

    saveInvoiceHeader,
    saveInvoiceItems,
    updateProductStock

} from "./api.js";

import {

    getInvoiceItems,
    validateInvoiceItems

} from "./invoiceTable.js";

import {

    getInvoiceTotals

} from "./calculations.js";

import {

    getPaymentState,
    validatePayment

} from "./payment.js";

/* ==========================================================
   Module State
========================================================== */

const saveState = {

    initialized: false,

    saving: false,

    invoiceId: null

};

/* ==========================================================
   Helpers
========================================================== */

function qs(id) {

    return document.getElementById(id);

}

function value(id) {

    return qs(id)?.value?.trim() || "";

}

/* ==========================================================
   Collect Invoice Header
========================================================== */

function buildInvoiceHeader() {

    const totals = getInvoiceTotals();

    const payment = getPaymentState();

    return {

        invoiceNumber:

            value("invoiceNumber"),

        invoiceDate:

            value("invoiceDate"),

        invoiceReference:

            value("invoiceReference"),

        customerId:

            value("customerId"),

        salesPerson:

            value("salesPerson"),

        remarks:

            value("invoiceRemarks"),

        subTotal:

            totals.subTotal,

        discount:

            totals.discount,

        tax:

            totals.gst,

        grandTotal:

            totals.grandTotal,

        paymentMode:

            payment.paymentMode,

        amountReceived:

            payment.amountReceived,

        balanceAmount:

            payment.balanceAmount,

        changeAmount:

            payment.changeAmount,

        paymentStatus:

            payment.paymentStatus

    };

}

/* ==========================================================
   Validate Customer
========================================================== */

function validateCustomer() {

    const customerId = value("customerId");

    if (!customerId) {

        return {

            valid: false,

            message: "Please select a customer."

        };

    }

    return {

        valid: true

    };

}

/* ==========================================================
   Validate Invoice Header
========================================================== */

function validateInvoiceHeader(header) {

    if (!header.invoiceNumber) {

        return {

            valid: false,

            message: "Invoice number is required."

        };

    }

    if (!header.invoiceDate) {

        return {

            valid: false,

            message: "Invoice date is required."

        };

    }

    return {

        valid: true

    };

}

/* ==========================================================
   Validate Complete Invoice
========================================================== */

function validateInvoice() {

    const header = buildInvoiceHeader();

    const headerValidation =

        validateInvoiceHeader(header);

    if (!headerValidation.valid)
        return headerValidation;

    const customerValidation =

        validateCustomer();

    if (!customerValidation.valid)
        return customerValidation;

    const itemValidation =

        validateInvoiceItems();

    if (!itemValidation.valid)
        return itemValidation;

    const paymentValidation =

        validatePayment();

    if (!paymentValidation.valid)
        return {

            valid: false,

            message: "Payment information is invalid."

        };

    return {

        valid: true,

        header

    };

}

/* ==========================================================
   Collect Invoice Items
========================================================== */

function buildInvoiceItems() {

    return getInvoiceItems()

        .filter(item =>

            item.productId

        )

        .map(item => ({

            ...item

        }));

}

/* ==========================================================
   Prepare Save Data
========================================================== */

function prepareInvoiceData() {

    const validation =

        validateInvoice();

    if (!validation.valid)
        return validation;

    const items =

        buildInvoiceItems();

    return {

        valid: true,

        header:

            validation.header,

        items

    };

}

/* ==========================================================
   Save Invoice Header
========================================================== */

async function saveHeader(header) {

    return await saveInvoiceHeader(header);

}

/* ==========================================================
   Save Invoice Items
========================================================== */

async function saveItems(invoiceId, items) {

    const invoiceItems =

        items.map(item => ({

            invoiceId,

            ...item

        }));

    return await saveInvoiceItems(

        invoiceItems

    );

}

/* ==========================================================
   Update Product Stock
========================================================== */

async function updateStock(items) {

    for (const item of items) {

    await updateProductStock(
        item.productId,
        item.qty
    );

}


/* ==========================================================
   Save Complete Invoice
========================================================== */

export async function saveInvoice() {

    if (saveState.saving) {

        return {

            success: false,

            message: "Invoice is already being saved."

        };

    }

    saveState.saving = true;

    try {

        const data =

            prepareInvoiceData();

        if (!data.valid) {

            return {

                success: false,

                message: data.message

            };

        }

        const invoiceId =

            await saveHeader(

                data.header

            );

        saveState.invoiceId =

            invoiceId;

        await saveItems(

            invoiceId,

            data.items

        );

        await updateStock(

            data.items

        );

        return {

            success: true,

            invoiceId

        };

    }

    catch (error) {

        console.error(

            "[Save Invoice]",

            error

        );

        return {

            success: false,

            message:

                error.message ||

                "Unable to save invoice."

        };

    }

    finally {

        saveState.saving = false;

    }

}

await updateInvoiceStock(data.items);
