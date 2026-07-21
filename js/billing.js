// ==========================================
// IMPORTS
// ==========================================

import { supabase } from "./supabase.js";

// ==========================================
// GLOBAL VARIABLES
// ==========================================

let customers = [];
let products = [];
let invoiceItems = [];
let currentInvoiceId = null;

// ==========================================
// DOM ELEMENTS
// ==========================================

const customerSelect = document.getElementById("customer");
const paymentMode = document.getElementById("paymentMode");
const invoiceNumber = document.getElementById("invoiceNumber");
const invoiceDate = document.getElementById("invoiceDate");

const customerGST = document.getElementById("customerGST");
const customerPhone = document.getElementById("customerPhone");
const customerAddress = document.getElementById("customerAddress");

const addRowBtn = document.getElementById("addRowBtn");

const invoiceTable = document.getElementById("invoiceItems");

const taxableValue = document.getElementById("taxableValue");
const discountTotal = document.getElementById("discountTotal");
const cgstTotal = document.getElementById("cgstTotal");
const sgstTotal = document.getElementById("sgstTotal");
const igstTotal = document.getElementById("igstTotal");
const grandTotal = document.getElementById("grandTotal");

const amountWords = document.getElementById("amountWords");

const paymentStatus = document.getElementById("paymentStatus");
const receivedAmount = document.getElementById("receivedAmount");
const balanceAmount = document.getElementById("balanceAmount");

const saveInvoiceBtn = document.getElementById("saveInvoiceBtn");
const printInvoiceBtn = document.getElementById("printInvoiceBtn");
const pdfInvoiceBtn = document.getElementById("pdfInvoiceBtn");

const loadingOverlay = document.getElementById("loadingOverlay");
const toastContainer = document.getElementById("toastContainer");

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", initBilling);

async function initBilling() {

    showLoading();

    try {

        setTodayDate();

        await generateInvoiceNumber();

        await loadCustomers();

        await loadProducts();

        await loadInvoiceHistory();

        hideLoading();

    } catch (error) {

        console.error(error);

        hideLoading();

        showToast(error.message, "error");

    }

}

// ==========================================
// TODAY DATE
// ==========================================

function setTodayDate() {

    invoiceDate.value = new Date().toISOString().split("T")[0];

}

// ==========================================
// GENERATE INVOICE NUMBER
// ==========================================

async function generateInvoiceNumber() {

    const { count } = await supabase
        .from("sales")
        .select("*", { count: "exact", head: true });

    const next = (count || 0) + 1;

    invoiceNumber.value =
        "INV-" + String(next).padStart(6, "0");

}

// ==========================================
// LOAD CUSTOMERS
// ==========================================

async function loadCustomers() {

    const { data, error } = await supabase

        .from("customers")

        .select("*")

        .order("customer_name");

    if (error) throw error;

    customers = data || [];

    customerSelect.innerHTML =
        `<option value="">Select Customer</option>`;

    customers.forEach(customer => {

        customerSelect.innerHTML += `

            <option value="${customer.id}">

                ${customer.customer_name}

            </option>

        `;

    });

}

// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    const { data, error } = await supabase

        .from("products")

        .select("*")

        .order("product");

    if (error) throw error;

    products = data || [];

}

// ==========================================
// CUSTOMER CHANGE
// ==========================================

customerSelect.addEventListener("change", () => {

    const customer = customers.find(

        c => c.id == customerSelect.value

    );

    if (!customer) return;

    customerGST.value =
        customer.gstin || "";

    customerPhone.value =
        customer.phone || "";

    customerAddress.value =
        customer.address || "";

});

// ==========================================
// BUTTON EVENTS
// ==========================================

addRowBtn.addEventListener("click", addProductRow);

saveInvoiceBtn.addEventListener("click", saveInvoice);

printInvoiceBtn.addEventListener("click", printInvoice);

pdfInvoiceBtn.addEventListener("click", exportPDF);

// ==========================================
// ADD PRODUCT ROW
// ==========================================

function addProductRow() {

    // Remove empty message
    const emptyRow = document.querySelector(".empty-row");
    if (emptyRow) emptyRow.remove();

    const row = document.createElement("tr");

    row.innerHTML = `

        <td class="row-no"></td>

        <td>
            <input type="text"
                   class="product-search"
                   placeholder="Search product..."
                   autocomplete="off">

            <div class="product-results"></div>
        </td>

        <td><input type="text" class="pack" readonly></td>

        <td><input type="text" class="batch" readonly></td>

        <td><input type="text" class="expiry" readonly></td>

        <td><input type="text" class="hsn" readonly></td>

        <td><input type="number" class="gst" readonly></td>

        <td>
            <input type="number"
                   class="qty"
                   min="1"
                   value="1">
        </td>

        <td><input type="text" class="unit" readonly></td>

        <td><input type="number" class="mrp" readonly></td>

        <td><input type="number" class="rate"></td>

        <td><input type="number" class="discount" value="0"></td>

        <td><input type="number" class="discountAmount" readonly></td>

        <td><input type="number" class="amount" readonly></td>

        <td>

            <button
                class="delete-row">

                ✖

            </button>

        </td>

    `;

    invoiceTable.appendChild(row);

    updateRowNumbers();

    initializeRow(row);

}

// ==========================================
// INITIALIZE ROW EVENTS
// ==========================================

function initializeRow(row) {

    const search = row.querySelector(".product-search");
    const qty = row.querySelector(".qty");
    const rate = row.querySelector(".rate");
    const discount = row.querySelector(".discount");

    const deleteBtn = row.querySelector(".delete-row");

    search.addEventListener("input", () => {

        searchProducts(search);

    });

    qty.addEventListener("input", () => {

        calculateRow(row);

    });

    rate.addEventListener("input", () => {

        calculateRow(row);

    });

    discount.addEventListener("input", () => {

        calculateRow(row);

    });

    deleteBtn.addEventListener("click", () => {

        row.remove();

        updateRowNumbers();

        calculateInvoice();

    });

}

// ==========================================
// LIVE PRODUCT SEARCH
// ==========================================

function searchProducts(input) {

    const keyword = input.value.toLowerCase();

    const resultsBox =
        input.parentElement.querySelector(".product-results");

    resultsBox.innerHTML = "";

    if (keyword.length < 1) {

        resultsBox.style.display = "none";

        return;

    }

    const filtered = products.filter(product =>

        product.product.toLowerCase().includes(keyword)

    );

    filtered.slice(0, 10).forEach(product => {

        const div = document.createElement("div");

        div.className = "search-item";

        div.textContent =
            `${product.product} (${product.batch})`;

        div.onclick = () => {

            fillProduct(rowFromInput(input), product);

            resultsBox.style.display = "none";

        };

        resultsBox.appendChild(div);

    });

    resultsBox.style.display = "block";

}

function rowFromInput(input) {

    return input.closest("tr");

}

// ==========================================
// FILL PRODUCT
// ==========================================

function fillProduct(row, product) {

    row.querySelector(".product-search").value =
        product.product;

    row.querySelector(".pack").value =
        product.pack_size || "";

    row.querySelector(".batch").value =
        product.batch || "";

    row.querySelector(".expiry").value =
        product.expiry || "";

    row.querySelector(".hsn").value =
        product.hsn || "";

    row.querySelector(".gst").value =
        product.gst || 0;

    row.querySelector(".unit").value =
        product.unit || "";

    row.querySelector(".mrp").value =
        product.mrp || 0;

    row.querySelector(".rate").value =
        product.selling_rate || 0;

    row.dataset.productId = product.id;

    row.dataset.stock = product.quantity;

    calculateRow(row);

}

// ==========================================
// UPDATE ROW NUMBERS
// ==========================================

function updateRowNumbers() {

    document
        .querySelectorAll("#invoiceItems tr")
        .forEach((row, index) => {

            const cell = row.querySelector(".row-no");

            if (cell)

                cell.textContent = index + 1;

        });

}

// ==========================================
// CALCULATE ROW
// ==========================================

function calculateRow(row) {

    const qty = parseFloat(row.querySelector(".qty").value) || 0;

    const rate = parseFloat(row.querySelector(".rate").value) || 0;

    const gst = parseFloat(row.querySelector(".gst").value) || 0;

    const discountPercent =
        parseFloat(row.querySelector(".discount").value) || 0;

    const stock =
        parseFloat(row.dataset.stock || 0);

    // Stock validation

    if (qty > stock) {

        showToast(
            `Only ${stock} item(s) available in stock.`,
            "warning"
        );

        row.querySelector(".qty").value = stock;

        return calculateRow(row);

    }

    // Gross Amount

    const gross = qty * rate;

    // Discount Amount

    const discountAmount =
        gross * discountPercent / 100;

    // Taxable Amount

    const taxable =
        gross - discountAmount;

    // GST Amount

    const gstAmount =
        taxable * gst / 100;

    // Final Amount

    const total =
        taxable + gstAmount;

    row.querySelector(".discountAmount").value =
        discountAmount.toFixed(2);

    row.querySelector(".amount").value =
        total.toFixed(2);

    calculateInvoice();

}

// ==========================================
// CALCULATE INVOICE
// ==========================================

function calculateInvoice() {

    let taxable = 0;
    let discount = 0;
    let gstTotal = 0;
    let grand = 0;

    document
        .querySelectorAll("#invoiceItems tr")
        .forEach(row => {

            if (!row.dataset.productId) return;

            const qty =
                parseFloat(row.querySelector(".qty").value) || 0;

            const rate =
                parseFloat(row.querySelector(".rate").value) || 0;

            const gst =
                parseFloat(row.querySelector(".gst").value) || 0;

            const disc =
                parseFloat(row.querySelector(".discountAmount").value) || 0;

            const gross = qty * rate;

            const taxableAmount =
                gross - disc;

            const gstAmount =
                taxableAmount * gst / 100;

            taxable += taxableAmount;

            discount += disc;

            gstTotal += gstAmount;

            grand += taxableAmount + gstAmount;

        });

    taxableValue.value =
        taxable.toFixed(2);

    discountTotal.value =
        discount.toFixed(2);

    cgstTotal.value =
        (gstTotal / 2).toFixed(2);

    sgstTotal.value =
        (gstTotal / 2).toFixed(2);

    igstTotal.value =
        "0.00";

    grandTotal.value =
        grand.toFixed(2);

    updatePaymentBalance();

    updateInvoiceSummary();

    updateAmountInWords();
updateGSTSummary();

updatePaymentStatus();

updateAmountInWords();

}

// ==========================================
// PAYMENT BALANCE
// ==========================================

function updatePaymentBalance() {

    const grand =
        parseFloat(grandTotal.value) || 0;

    const received =
        parseFloat(receivedAmount.value) || 0;

    balanceAmount.value =
        (grand - received).toFixed(2);

}

receivedAmount.addEventListener(
    "input",
    updatePaymentBalance
);

// ==========================================
// INVOICE SUMMARY
// ==========================================

function updateInvoiceSummary() {

    let totalProducts = 0;

    let totalQty = 0;

    document
        .querySelectorAll("#invoiceItems tr")
        .forEach(row => {

            if (!row.dataset.productId) return;

            totalProducts++;

            totalQty +=
                parseFloat(
                    row.querySelector(".qty").value
                ) || 0;

        });

    document.getElementById("totalProducts").value =
        totalProducts;

    document.getElementById("totalQuantity").value =
        totalQty;

    document.getElementById("invoiceDiscount").value =
        discountTotal.value;

    document.getElementById("invoiceGST").value =
        (
            parseFloat(cgstTotal.value) +
            parseFloat(sgstTotal.value) +
            parseFloat(igstTotal.value)
        ).toFixed(2);

}

document
    .getElementById("roundOff")
    .addEventListener("input", () => {

        const round =
            parseFloat(
                document.getElementById("roundOff").value
            ) || 0;

        const total =
            parseFloat(taxableValue.value) +
            parseFloat(cgstTotal.value) +
            parseFloat(sgstTotal.value) +
            parseFloat(igstTotal.value) +
            round;

        grandTotal.value = total.toFixed(2);

        updatePaymentBalance();

        updateAmountInWords();

    });

// ==========================================
// AMOUNT IN WORDS
// ==========================================

function updateAmountInWords() {

    const amount =
        Math.round(parseFloat(grandTotal.value) || 0);

    amountWords.value =
        numberToWords(amount) + " Rupees Only";

}

function numberToWords(num) {

    if (num === 0) return "Zero";

    const ones = [
        "", "One", "Two", "Three", "Four",
        "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen",
        "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    ];

    const tens = [
        "", "", "Twenty", "Thirty", "Forty",
        "Fifty", "Sixty", "Seventy",
        "Eighty", "Ninety"
    ];

    function convert(n) {

        if (n < 20)
            return ones[n];

        if (n < 100)
            return tens[Math.floor(n / 10)] +
                (n % 10 ? " " + ones[n % 10] : "");

        if (n < 1000)
            return ones[Math.floor(n / 100)] +
                " Hundred " +
                (n % 100 ? convert(n % 100) : "");

        if (n < 100000)
            return convert(Math.floor(n / 1000)) +
                " Thousand " +
                (n % 1000 ? convert(n % 1000) : "");

        if (n < 10000000)
            return convert(Math.floor(n / 100000)) +
                " Lakh " +
                (n % 100000 ? convert(n % 100000) : "");

        return convert(Math.floor(n / 10000000)) +
            " Crore " +
            (n % 10000000 ? convert(n % 10000000) : "");

    }

    return convert(num).replace(/\s+/g, " ").trim();

}

// ==========================================
// GST SUMMARY
// ==========================================

function updateGSTSummary() {

    const summary = {};

    document
        .querySelectorAll("#invoiceItems tr")
        .forEach(row => {

            if (!row.dataset.productId) return;

            const qty =
                parseFloat(row.querySelector(".qty").value) || 0;

            const rate =
                parseFloat(row.querySelector(".rate").value) || 0;

            const gst =
                parseFloat(row.querySelector(".gst").value) || 0;

            const discount =
                parseFloat(row.querySelector(".discountAmount").value) || 0;

            const taxable =
                (qty * rate) - discount;

            const tax =
                taxable * gst / 100;

            if (!summary[gst]) {

                summary[gst] = {

                    taxable: 0,
                    tax: 0

                };

            }

            summary[gst].taxable += taxable;
            summary[gst].tax += tax;

        });

    const tbody =
        document.getElementById("gstSummary");

    tbody.innerHTML = "";

    Object.keys(summary).forEach(rate => {

        const s = summary[rate];

        tbody.innerHTML += `

            <tr>

                <td>${rate}%</td>

                <td>${s.taxable.toFixed(2)}</td>

                <td>${(s.tax/2).toFixed(2)}</td>

                <td>${(s.tax/2).toFixed(2)}</td>

                <td>0.00</td>

                <td>${s.tax.toFixed(2)}</td>

            </tr>

        `;

    });

}

// ==========================================
// PAYMENT STATUS
// ==========================================

function updatePaymentStatus() {

    const grand =
        parseFloat(grandTotal.value) || 0;

    const received =
        parseFloat(receivedAmount.value) || 0;

    if (received <= 0) {

        paymentStatus.value = "Credit";

    }

    else if (received < grand) {

        paymentStatus.value = "Partial";

    }

    else {

        paymentStatus.value = "Paid";

    }

}

receivedAmount.addEventListener("input", () => {

    updatePaymentBalance();

    updatePaymentStatus();

});

// ==========================================
// TOAST
// ==========================================

function showToast(message, type = "success") {

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.textContent =
        message;

    toastContainer.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}

// ==========================================
// LOADING
// ==========================================

function showLoading() {

    loadingOverlay.style.display = "flex";

}

function hideLoading() {

    loadingOverlay.style.display = "none";

}

// ==========================================
// SAVE INVOICE
// ==========================================

async function saveInvoice() {

    try {

        showLoading();

        // Basic Validation

        if (!customerSelect.value) {

            throw new Error("Please select a customer.");

        }

        const rows = document.querySelectorAll("#invoiceItems tr");

        const validRows = [...rows].filter(r => r.dataset.productId);

        if (validRows.length === 0) {

            throw new Error("Please add at least one product.");

        }

        // Insert Sales Header

        const { data: salesData, error: salesError } =
            await supabase
                .from("sales")
                .insert([{

                    invoice_no: invoiceNumber.value,
                    invoice_date: invoiceDate.value,

                    customer_id: customerSelect.value,

                    payment_mode: paymentMode.value,

                    payment_status: paymentStatus.value,

                    remarks:
                        document.getElementById("remarks").value,

                    taxable_value:
                        parseFloat(taxableValue.value),

                    discount:
                        parseFloat(discountTotal.value),

                    cgst:
                        parseFloat(cgstTotal.value),

                    sgst:
                        parseFloat(sgstTotal.value),

                    igst:
                        parseFloat(igstTotal.value),

                    grand_total:
                        parseFloat(grandTotal.value),

                    received_amount:
                        parseFloat(receivedAmount.value || 0),

                    balance_amount:
                        parseFloat(balanceAmount.value || 0)

                }])

                .select()

                .single();

        if (salesError) throw salesError;

        currentInvoiceId = salesData.id;

        await saveInvoiceItems(validRows);

        hideLoading();

        showToast("Invoice saved successfully.");

        await generateInvoiceNumber();

        clearInvoice();

        await loadInvoiceHistory();

    }

    catch (error) {

        hideLoading();

        console.error(error);

        showToast(error.message, "error");

    }

}

// ==========================================
// SAVE ITEMS
// ==========================================

async function saveInvoiceItems(rows) {

    for (const row of rows) {

        const qty =
            parseFloat(row.querySelector(".qty").value);

        const rate =
            parseFloat(row.querySelector(".rate").value);

        const gst =
            parseFloat(row.querySelector(".gst").value);

        const discount =
            parseFloat(
                row.querySelector(".discountAmount").value
            );

        const amount =
            parseFloat(row.querySelector(".amount").value);

        const productId =
            row.dataset.productId;

        const { error } =
            await supabase

                .from("sales_items")

                .insert([{

                    sales_id: currentInvoiceId,

                    product_id: productId,

                    batch:
                        row.querySelector(".batch").value,

                    expiry:
                        row.querySelector(".expiry").value,

                    hsn:
                        row.querySelector(".hsn").value,

                    gst,

                    qty,

                    unit:
                        row.querySelector(".unit").value,

                    rate,

                    discount,

                    amount

                }]);

        if (error) throw error;

        await updateStock(productId, qty);

    }

}

// ==========================================
// UPDATE STOCK
// ==========================================

async function updateStock(productId, soldQty) {

    const product =
        products.find(p => p.id == productId);

    if (!product)
        return;

    const newQty =
        product.quantity - soldQty;

    const { error } =
        await supabase

            .from("products")

            .update({

                quantity: newQty

            })

            .eq("id", productId);

    if (error)
        throw error;

    product.quantity = newQty;

}

// ==========================================
// CLEAR FORM
// ==========================================

function clearInvoice() {

    customerSelect.value = "";

    customerGST.value = "";

    customerPhone.value = "";

    customerAddress.value = "";

    invoiceTable.innerHTML = `

        <tr class="empty-row">

            <td colspan="15">

                Click <b>+ Add Product</b>

            </td>

        </tr>

    `;

    taxableValue.value = "0.00";

    discountTotal.value = "0.00";

    cgstTotal.value = "0.00";

    sgstTotal.value = "0.00";

    igstTotal.value = "0.00";

    grandTotal.value = "0.00";

    receivedAmount.value = "0";

    balanceAmount.value = "0.00";

    amountWords.value = "";

    document.getElementById("remarks").value = "";

    document.getElementById("gstSummary").innerHTML = "";

    document.getElementById("totalProducts").value = "0";

    document.getElementById("totalQuantity").value = "0";

}

// ==========================================
// LOAD INVOICE HISTORY
// ==========================================

async function loadInvoiceHistory() {

    const { data, error } = await supabase
        .from("sales")
        .select(`
            *,
            customers(customer_name)
        `)
        .order("id", { ascending: false })
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    const tbody = document.getElementById("invoiceHistory");

    tbody.innerHTML = "";

    if (!data || data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">No invoices found.</td>
            </tr>
        `;

        return;
    }

    data.forEach(invoice => {

        tbody.innerHTML += `

        <tr>

            <td>${invoice.invoice_no}</td>

            <td>${invoice.invoice_date}</td>

            <td>${invoice.customers?.customer_name || ""}</td>

            <td>₹${Number(invoice.grand_total).toFixed(2)}</td>

            <td>${invoice.payment_status}</td>

            <td>

                <button
                    class="print-btn"
                    onclick="printOldInvoice(${invoice.id})">

                    Print

                </button>

                <button
                    class="delete-btn"
                    onclick="cancelInvoice(${invoice.id})">

                    Cancel

                </button>

            </td>

        </tr>

        `;

    });

}

// ==========================================
// PRINT
// ==========================================

function printInvoice() {

    window.print();

}

// ==========================================
// EXPORT PDF
// ==========================================

function exportPDF() {

    window.print();

}

// ==========================================
// PRINT OLD INVOICE
// ==========================================

window.printOldInvoice = async function(id) {

    showToast(
        "Old invoice printing will be available in the next update."
    );

};

// ==========================================
// CANCEL INVOICE
// ==========================================

window.cancelInvoice = async function(id) {

    if (!confirm("Cancel this invoice?")) return;

    try {

        showLoading();

        // Get Items

        const { data: items } =
            await supabase

                .from("sales_items")

                .select("*")

                .eq("sales_id", id);

        // Restore Stock

        for (const item of items || []) {

            const product =
                products.find(p => p.id == item.product_id);

            if (!product)
                continue;

            const qty =
                product.quantity + item.qty;

            await supabase

                .from("products")

                .update({

                    quantity: qty

                })

                .eq("id", item.product_id);

        }

        // Delete Items

        await supabase

            .from("sales_items")

            .delete()

            .eq("sales_id", id);

        // Delete Invoice

        await supabase

            .from("sales")

            .delete()

            .eq("id", id);

        await loadProducts();

        await loadInvoiceHistory();

        hideLoading();

        showToast("Invoice cancelled.");

    }

    catch (error) {

        hideLoading();

        console.error(error);

        showToast(error.message, "error");

    }

};

// ==========================================
// DASHBOARD
// ==========================================

async function loadDashboard() {

    const today =
        new Date().toISOString().split("T")[0];

    const { data } =
        await supabase

            .from("sales")

            .select("*")

            .eq("invoice_date", today);

    let totalSales = 0;
    let invoices = 0;

    data?.forEach(invoice => {

        invoices++;

        totalSales +=
            Number(invoice.grand_total);

    });

    document.getElementById("todaySales").innerText =
        "₹" + totalSales.toFixed(2);

    document.getElementById("todayInvoices").innerText =
        invoices;

}



