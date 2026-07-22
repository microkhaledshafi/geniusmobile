// ======================================================
// billing.js
// PART 1 - INITIALIZATION
// Genius Scientific ERP
// ======================================================

import { supabase } from "./supabase.js";

// ======================================================
// GLOBAL VARIABLES
// ======================================================

let customers = [];
let products = [];
let invoiceItems = [];
let invoiceHistory = [];

const companyState = "Jammu & Kashmir";

// ======================================================
// DOM ELEMENTS
// ======================================================

const DOM = {

    invoiceNumber: document.getElementById("invoiceNumber"),
    invoiceDate: document.getElementById("invoiceDate"),

    customer: document.getElementById("customer"),
    customerGST: document.getElementById("customerGST"),
    customerPhone: document.getElementById("customerPhone"),
    customerAddress: document.getElementById("customerAddress"),

    paymentMode: document.getElementById("paymentMode"),
    paymentStatus: document.getElementById("paymentStatus"),

    invoiceItems: document.getElementById("invoiceItems"),

    taxableValue: document.getElementById("taxableValue"),
    discountTotal: document.getElementById("discountTotal"),
    cgstTotal: document.getElementById("cgstTotal"),
    sgstTotal: document.getElementById("sgstTotal"),
    igstTotal: document.getElementById("igstTotal"),
    roundOff: document.getElementById("roundOff"),
    grandTotal: document.getElementById("grandTotal"),

    receivedAmount: document.getElementById("receivedAmount"),
    balanceAmount: document.getElementById("balanceAmount"),

    remarks: document.getElementById("remarks"),
    amountWords: document.getElementById("amountWords"),

    addRowBtn: document.getElementById("addRowBtn"),
    saveInvoiceBtn: document.getElementById("saveInvoiceBtn"),
    printInvoiceBtn: document.getElementById("printInvoiceBtn"),
    pdfInvoiceBtn: document.getElementById("pdfInvoiceBtn"),
    newInvoiceBtn: document.getElementById("newInvoiceBtn"),
    cancelInvoiceBtn: document.getElementById("cancelInvoiceBtn"),

    todaySales: document.getElementById("todaySales"),
    todayInvoices: document.getElementById("todayInvoices"),
    todayItems: document.getElementById("todayItems"),
    pendingAmount: document.getElementById("pendingAmount"),

    invoiceHistory: document.getElementById("invoiceHistory"),

    loadingOverlay: document.getElementById("loadingOverlay"),
    toastContainer: document.getElementById("toastContainer")

};

// ======================================================
// HELPERS
// ======================================================

const money = value => Number(value || 0).toFixed(2);

const today = () => new Date().toISOString().split("T")[0];

const uuid = () =>
    crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString();

// ======================================================
// LOADING
// ======================================================

function showLoading() {

    if (DOM.loadingOverlay)
        DOM.loadingOverlay.style.display = "flex";

}

function hideLoading() {

    if (DOM.loadingOverlay)
        DOM.loadingOverlay.style.display = "none";

}

// ======================================================
// TOAST
// ======================================================

function showToast(message, type = "success") {

    if (!DOM.toastContainer) {

        alert(message);

        return;

    }

    const toast = document.createElement("div");

    toast.className =
        `toast align-items-center text-bg-${type} border-0 show mb-2`;

    toast.innerHTML = `

        <div class="d-flex">

            <div class="toast-body">

                ${message}

            </div>

            <button
                class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast">

            </button>

        </div>

    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}

// ======================================================
// SET TODAY
// ======================================================

function setInvoiceDate() {

    DOM.invoiceDate.value = today();

}

// ======================================================
// GENERATE INVOICE NUMBER
// ======================================================

async function generateInvoiceNumber() {

    const { count, error } = await supabase

        .from("sales")

        .select("*", {

            count: "exact",
            head: true

        });

    if (error)
        throw error;

    const next = (count || 0) + 1;

    DOM.invoiceNumber.value =
        "INV-" + String(next).padStart(6, "0");

}

// ======================================================
// LOAD CUSTOMERS
// ======================================================

async function loadCustomers() {

    const { data, error } = await supabase

        .from("customers")

        .select("*")

        .order("customer_name");

    if (error)
        throw error;

    customers = data || [];

    DOM.customer.innerHTML =
        `<option value="">Select Customer</option>`;

    customers.forEach(c => {

        DOM.customer.innerHTML += `

            <option value="${c.id}">

                ${c.customer_name}

            </option>

        `;

    });

}

// ======================================================
// LOAD PRODUCTS
// ======================================================

async function loadProducts() {

    const { data, error } = await supabase

        .from("products")

        .select("*")

        .order("product");

    if (error)
        throw error;

    products = data || [];

    console.log(products.length + " products loaded");

}

// ======================================================
// CUSTOMER CHANGE
// ======================================================

function customerChanged() {

    const customer = customers.find(

        c => Number(c.id) === Number(DOM.customer.value)

    );

    if (!customer)
        return;

    DOM.customerGST.value =
        customer.gstin || "";

    DOM.customerPhone.value =
        customer.phone || "";

    DOM.customerAddress.value =
        customer.address || "";

}

// ======================================================
// REGISTER EVENTS
// ======================================================

function registerEvents() {

    DOM.customer?.addEventListener(
        "change",
        customerChanged
    );

    DOM.addRowBtn?.addEventListener(
        "click",
        addProductRow
    );

    DOM.receivedAmount?.addEventListener(
        "input",
        calculateBalance
    );

    DOM.newInvoiceBtn?.addEventListener(
        "click",
        newInvoice
    );

    DOM.saveInvoiceBtn?.addEventListener(
        "click",
        saveInvoice
    );

    DOM.printInvoiceBtn?.addEventListener(
        "click",
        printInvoice
    );

    DOM.pdfInvoiceBtn?.addEventListener(
        "click",
        exportPDF
    );

}

// ======================================================
// INITIALIZE
// ======================================================

async function initBilling() {

    try {

        showLoading();

        setInvoiceDate();

        await generateInvoiceNumber();

        await loadCustomers();

        await loadProducts();

        registerEvents();

        hideLoading();

        console.log("Billing Ready");

    }

    catch (err) {

        hideLoading();

        console.error(err);

        showToast(err.message, "danger");

    }

}

// ======================================================
// START
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    initBilling

);

// ======================================================
// PART 2A
// PRODUCT ROWS
// ======================================================

function updateRowNumbers() {

    const rows = DOM.invoiceItems.querySelectorAll("tr.product-row");

    rows.forEach((row, index) => {

        row.querySelector(".rowNo").textContent = index + 1;

    });

}

// ======================================================
// CREATE PRODUCT ROW
// ======================================================

function addProductRow() {

    const empty = DOM.invoiceItems.querySelector(".empty-row");

    if (empty)
        empty.remove();

    const row = document.createElement("tr");

    row.className = "product-row";

    row.innerHTML = `

<td class="rowNo text-center"></td>

<td style="position:relative;min-width:260px;">

    <input
        type="text"
        class="form-control productSearch"
        placeholder="Search Product"
        autocomplete="off">

    <div class="searchResults"></div>

</td>

<td>

    <input
        class="form-control pack"
        readonly>

</td>

<td>

    <input
        class="form-control batch"
        readonly>

</td>

<td>

    <input
        class="form-control expiry"
        readonly>

</td>

<td>

    <input
        class="form-control hsn"
        readonly>

</td>

<td>

    <input
        class="form-control gst text-end"
        readonly>

</td>

<td>

    <input
        type="number"
        min="1"
        value="1"
        class="form-control qty text-end">

</td>

<td>

    <input
        class="form-control unit"
        readonly>

</td>

<td>

    <input
        class="form-control mrp text-end"
        readonly>

</td>

<td>

    <input
        class="form-control rate text-end">

</td>

<td>

    <input
        type="number"
        value="0"
        class="form-control discount text-end">

</td>

<td>

    <input
        class="form-control discountAmount text-end"
        readonly>

</td>

<td>

    <input
        class="form-control taxable text-end"
        readonly>

</td>

<td>

    <input
        class="form-control gstAmount text-end"
        readonly>

</td>

<td>

    <input
        class="form-control total text-end"
        readonly>

</td>

<td class="text-center">

    <button
        class="btn btn-sm btn-danger deleteRow">

        <i class="bi bi-trash"></i>

    </button>

</td>

`;

    DOM.invoiceItems.appendChild(row);

    initializeRow(row);

    updateRowNumbers();

}

// ======================================================
// INITIALIZE ROW
// ======================================================

function initializeRow(row) {

    const search = row.querySelector(".productSearch");

    const qty = row.querySelector(".qty");

    const rate = row.querySelector(".rate");

    const discount = row.querySelector(".discount");

    const deleteBtn = row.querySelector(".deleteRow");

    //--------------------------------

    search.addEventListener("input", () => {

        searchProducts(search);

    });

    //--------------------------------

    qty.addEventListener("input", () => {

        validateStock(row);

        calculateRow(row);

    });

    //--------------------------------

    rate.addEventListener("input", () => {

        calculateRow(row);

    });

    //--------------------------------

    discount.addEventListener("input", () => {

        calculateRow(row);

    });

    //--------------------------------

    deleteBtn.addEventListener("click", () => {

        row.remove();

        updateRowNumbers();

        calculateInvoice();

        if (!DOM.invoiceItems.querySelector("tr.product-row")) {

            DOM.invoiceItems.innerHTML = `

<tr class="empty-row">

<td colspan="17"
class="text-center py-4">

No products added

</td>

</tr>

`;

        }

    });

}

// ======================================================
// STOCK VALIDATION
// ======================================================

function validateStock(row) {

    const available =
        Number(row.dataset.stock || 0);

    const qty =
        Number(row.querySelector(".qty").value);

    if (qty <= available)
        return;

    showToast(

        `Only ${available} in stock.`,

        "warning"

    );

    row.querySelector(".qty").value = available;

}

// ======================================================
// GET CURRENT ROW
// ======================================================

function getCurrentRow(element) {

    return element.closest("tr");

}

// ======================================================
// CLEAR PRODUCT
// ======================================================

function clearProduct(row) {

    row.removeAttribute("data-product-id");

    row.dataset.stock = 0;

    row.querySelector(".pack").value = "";

    row.querySelector(".batch").value = "";

    row.querySelector(".expiry").value = "";

    row.querySelector(".hsn").value = "";

    row.querySelector(".gst").value = "";

    row.querySelector(".qty").value = 1;

    row.querySelector(".unit").value = "";

    row.querySelector(".mrp").value = "";

    row.querySelector(".rate").value = "";

    row.querySelector(".discount").value = 0;

    row.querySelector(".discountAmount").value = "";

    row.querySelector(".taxable").value = "";

    row.querySelector(".gstAmount").value = "";

    row.querySelector(".total").value = "";

}

// ======================================================
// FOCUS FIRST PRODUCT
// ======================================================

function focusFirstProduct() {

    const first =

        DOM.invoiceItems.querySelector(

            ".productSearch"

        );

    if (first)
        first.focus();

}

// ======================================================
// PART 2B
// PRODUCT SEARCH
// ======================================================

function searchProducts(input) {

    const keyword = input.value.trim().toLowerCase();

    const row = getCurrentRow(input);

    const results = row.querySelector(".searchResults");

    results.innerHTML = "";

    if (keyword.length < 1) {

        results.style.display = "none";

        return;

    }

    const filtered = products.filter(product => {

        return (

            product.product?.toLowerCase().includes(keyword)

            ||

            product.manufacturer?.toLowerCase().includes(keyword)

            ||

            product.batch?.toLowerCase().includes(keyword)

            ||

            product.hsn?.toLowerCase().includes(keyword)

        );

    });

    if (!filtered.length) {

        results.style.display = "none";

        return;

    }

    filtered.slice(0, 15).forEach(product => {

        const item = document.createElement("div");

        item.className = "search-item";

        item.innerHTML = `

<div class="fw-bold">

${product.product}

</div>

<small>

${product.manufacturer || ""}

&nbsp;|&nbsp;

Batch :

${product.batch || "-"}

&nbsp;|&nbsp;

Stock :

${product.quantity}

</small>

`;

        item.addEventListener("click", () => {

            selectProduct(row, product);

        });

        results.appendChild(item);

    });

    results.style.display = "block";

}

// ======================================================
// SELECT PRODUCT
// ======================================================

function selectProduct(row, product) {

    row.dataset.productId = product.id;

    row.dataset.stock = product.quantity;

    row.querySelector(".productSearch").value =
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

    row.querySelector(".discount").value = 0;

    hideSearch(row);

    calculateRow(row);

    row.querySelector(".qty").focus();

}

// ======================================================
// HIDE SEARCH
// ======================================================

function hideSearch(row) {

    const results = row.querySelector(".searchResults");

    results.innerHTML = "";

    results.style.display = "none";

}

// ======================================================
// CLICK OUTSIDE
// ======================================================

document.addEventListener("click", e => {

    document.querySelectorAll(".searchResults")

        .forEach(box => {

            if (!box.parentElement.contains(e.target)) {

                box.style.display = "none";

            }

        });

});

// ======================================================
// KEYBOARD NAVIGATION
// ======================================================

document.addEventListener("keydown", e => {

    if (!e.target.classList.contains("productSearch"))
        return;

    const row = getCurrentRow(e.target);

    const items = row.querySelectorAll(".search-item");

    if (!items.length)
        return;

    let index = [...items]

        .findIndex(i =>

            i.classList.contains("active")

        );

    //----------------------------------

    if (e.key === "ArrowDown") {

        e.preventDefault();

        if (index < items.length - 1)
            index++;

    }

    //----------------------------------

    if (e.key === "ArrowUp") {

        e.preventDefault();

        if (index > 0)
            index--;

    }

    //----------------------------------

    items.forEach(i =>

        i.classList.remove("active")

    );

    if (index >= 0) {

        items[index].classList.add("active");

        items[index].scrollIntoView({

            block: "nearest"

        });

    }

    //----------------------------------

    if (e.key === "Enter") {

        e.preventDefault();

        if (index >= 0) {

            items[index].click();

        }

    }

});

// ======================================================
// PART 3
// CALCULATION ENGINE
// ======================================================

//----------------------------------------------
// ROUND TO 2 DECIMALS
//----------------------------------------------

function round2(value) {

    return Number(Number(value || 0).toFixed(2));

}

//----------------------------------------------
// CALCULATE SINGLE ROW
//----------------------------------------------

function calculateRow(row) {

    if (!row)
        return;

    validateStock(row);

    const qty =
        Number(row.querySelector(".qty").value || 0);

    const rate =
        Number(row.querySelector(".rate").value || 0);

    const gst =
        Number(row.querySelector(".gst").value || 0);

    const discountPercent =
        Number(row.querySelector(".discount").value || 0);

    //------------------------------------------

    const gross = qty * rate;

    const discountAmount =
        gross * discountPercent / 100;

    const taxable =
        gross - discountAmount;

    const gstAmount =
        taxable * gst / 100;

    const total =
        taxable + gstAmount;

    //------------------------------------------

    row.querySelector(".discountAmount").value =
        round2(discountAmount);

    row.querySelector(".taxable").value =
        round2(taxable);

    row.querySelector(".gstAmount").value =
        round2(gstAmount);

    row.querySelector(".total").value =
        round2(total);

    //------------------------------------------

    calculateInvoice();

}

//----------------------------------------------
// CALCULATE COMPLETE INVOICE
//----------------------------------------------

function calculateInvoice() {

    let taxable = 0;

    let discount = 0;

    let gst = 0;

    let grand = 0;

    let totalQty = 0;

    document

        .querySelectorAll("tr.product-row")

        .forEach(row => {

            taxable += Number(

                row.querySelector(".taxable").value || 0

            );

            discount += Number(

                row.querySelector(".discountAmount").value || 0

            );

            gst += Number(

                row.querySelector(".gstAmount").value || 0

            );

            grand += Number(

                row.querySelector(".total").value || 0

            );

            totalQty += Number(

                row.querySelector(".qty").value || 0

            );

        });

    //------------------------------------------

    taxable = round2(taxable);

    discount = round2(discount);

    gst = round2(gst);

    grand = round2(grand);

    //------------------------------------------
    // GST SPLIT
    //------------------------------------------

    let cgst = 0;

    let sgst = 0;

    let igst = 0;

    if (companyState === "Jammu & Kashmir") {

        cgst = round2(gst / 2);

        sgst = round2(gst / 2);

    }

    else {

        igst = gst;

    }

    //------------------------------------------

    const roundedGrand =
        Math.round(grand);

    const roundOff =
        round2(roundedGrand - grand);

    //------------------------------------------

    DOM.taxableValue.value =
        taxable.toFixed(2);

    DOM.discountTotal.value =
        discount.toFixed(2);

    DOM.cgstTotal.value =
        cgst.toFixed(2);

    DOM.sgstTotal.value =
        sgst.toFixed(2);

    DOM.igstTotal.value =
        igst.toFixed(2);

    DOM.roundOff.value =
        roundOff.toFixed(2);

    DOM.grandTotal.value =
        roundedGrand.toFixed(2);

    //------------------------------------------

    if (DOM.todayItems)
        DOM.todayItems.textContent = totalQty;

    //------------------------------------------

    if (DOM.amountWords) {

        DOM.amountWords.textContent =

            numberToWords(roundedGrand)

            +

            " Only";

    }

    //------------------------------------------

    calculateBalance();

}

//----------------------------------------------
// RECEIVED / BALANCE
//----------------------------------------------

function calculateBalance() {

    const grand =
        Number(DOM.grandTotal.value || 0);

    const received =
        Number(DOM.receivedAmount.value || 0);

    DOM.balanceAmount.value =
        round2(grand - received).toFixed(2);

}

//----------------------------------------------
// RESET SUMMARY
//----------------------------------------------

function resetTotals() {

    DOM.taxableValue.value = "0.00";

    DOM.discountTotal.value = "0.00";

    DOM.cgstTotal.value = "0.00";

    DOM.sgstTotal.value = "0.00";

    DOM.igstTotal.value = "0.00";

    DOM.roundOff.value = "0.00";

    DOM.grandTotal.value = "0.00";

    DOM.receivedAmount.value = "0.00";

    DOM.balanceAmount.value = "0.00";

    if (DOM.amountWords)
        DOM.amountWords.textContent =
            "Zero Rupees Only";

}

//----------------------------------------------
// NEW INVOICE
//----------------------------------------------

async function newInvoice() {

    DOM.invoiceItems.innerHTML = `

<tr class="empty-row">

<td colspan="17"
class="text-center py-4">

Click Add Product to start billing

</td>

</tr>

`;

    DOM.customer.value = "";

    DOM.customerGST.value = "";

    DOM.customerPhone.value = "";

    DOM.customerAddress.value = "";

    DOM.remarks.value = "";

    resetTotals();

    await generateInvoiceNumber();

    focusFirstProduct();

}

// ======================================================
// PART 3B
// INVOICE DATA PREPARATION
// ======================================================

//-------------------------------------------------------
// NUMBER TO WORDS (INDIAN)
//-------------------------------------------------------

const ONES = [
    "",
    "One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen",
    "Sixteen","Seventeen","Eighteen","Nineteen"
];

const TENS = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety"
];

function twoDigitWords(num){

    if(num<20)
        return ONES[num];

    return TENS[Math.floor(num/10)] +

        (num%10 ? " "+ONES[num%10] : "");

}

function threeDigitWords(num){

    let text="";

    if(num>=100){

        text += ONES[Math.floor(num/100)]+" Hundred ";

        num%=100;

    }

    if(num>0){

        text += twoDigitWords(num);

    }

    return text.trim();

}

function numberToWords(number){

    number=Math.round(Number(number));

    if(number===0)
        return "Zero Rupees";

    let result="";

    const crore=Math.floor(number/10000000);

    number%=10000000;

    const lakh=Math.floor(number/100000);

    number%=100000;

    const thousand=Math.floor(number/1000);

    number%=1000;

    const hundred=number;

    if(crore){

        result+=threeDigitWords(crore)+" Crore ";

    }

    if(lakh){

        result+=threeDigitWords(lakh)+" Lakh ";

    }

    if(thousand){

        result+=threeDigitWords(thousand)+" Thousand ";

    }

    if(hundred){

        result+=threeDigitWords(hundred);

    }

    return result.trim()+" Rupees";

}

//-------------------------------------------------------
// VALIDATE INVOICE
//-------------------------------------------------------

function validateInvoice(){

    if(!DOM.customer.value){

        showToast("Select Customer","danger");

        return false;

    }

    const rows=document.querySelectorAll("tr.product-row");

    if(rows.length===0){

        showToast("Add at least one product","danger");

        return false;

    }

    let valid=true;

    rows.forEach(row=>{

        if(!row.dataset.productId){

            valid=false;

        }

    });

    if(!valid){

        showToast("One or more products not selected","danger");

        return false;

    }

    return true;

}

//-------------------------------------------------------
// GET SALES ITEMS
//-------------------------------------------------------

function getInvoiceItems(){

    const items=[];

    document

        .querySelectorAll("tr.product-row")

        .forEach(row=>{

            items.push({

                product_id:Number(row.dataset.productId),

                product_name:

                    row.querySelector(".productSearch").value,

                batch:

                    row.querySelector(".batch").value,

                expiry:

                    row.querySelector(".expiry").value,

                pack_size:

                    row.querySelector(".pack").value,

                hsn:

                    row.querySelector(".hsn").value,

                gst:Number(

                    row.querySelector(".gst").value||0

                ),

                qty:Number(

                    row.querySelector(".qty").value||0

                ),

                unit:

                    row.querySelector(".unit").value,

                mrp:Number(

                    row.querySelector(".mrp").value||0

                ),

                rate:Number(

                    row.querySelector(".rate").value||0

                ),

                discount_percent:Number(

                    row.querySelector(".discount").value||0

                ),

                discount_amount:Number(

                    row.querySelector(".discountAmount").value||0

                ),

                taxable_amount:Number(

                    row.querySelector(".taxable").value||0

                ),

                gst_amount:Number(

                    row.querySelector(".gstAmount").value||0

                ),

                amount:Number(

                    row.querySelector(".total").value||0

                )

            });

        });

    return items;

}

//-------------------------------------------------------
// BUILD SALES OBJECT
//-------------------------------------------------------

function buildInvoiceObject(){

    return{

        invoice_no:

            DOM.invoiceNumber.value,

        invoice_date:

            DOM.invoiceDate.value,

        customer_id:

            Number(DOM.customer.value),

        payment_mode:

            DOM.paymentMode.value,

        payment_status:

            DOM.paymentStatus.value,

        remarks:

            DOM.remarks.value,

        taxable_value:Number(

            DOM.taxableValue.value||0

        ),

        discount:Number(

            DOM.discountTotal.value||0

        ),

        cgst:Number(

            DOM.cgstTotal.value||0

        ),

        sgst:Number(

            DOM.sgstTotal.value||0

        ),

        igst:Number(

            DOM.igstTotal.value||0

        ),

        round_off:Number(

            DOM.roundOff.value||0

        ),

        grand_total:Number(

            DOM.grandTotal.value||0

        ),

        received_amount:Number(

            DOM.receivedAmount.value||0

        ),

        balance_amount:Number(

            DOM.balanceAmount.value||0

        )

    };

}

//-------------------------------------------------------
// READY FOR SAVE
//-------------------------------------------------------

function prepareInvoiceData(){

    if(!validateInvoice())
        return null;

    return{

        sale:buildInvoiceObject(),

        items:getInvoiceItems()

    };

}

// ======================================================
// PART 4A
// SAVE INVOICE
// ======================================================

async function saveInvoice() {

    const invoice = prepareInvoiceData();

    if (!invoice)
        return;

    showLoading("Saving Invoice...");

    try {

        //------------------------------------------------
        // INSERT SALES HEADER
        //------------------------------------------------

        const { data: saleData, error: saleError } =
            await supabase
                .from("sales")
                .insert(invoice.sale)
                .select()
                .single();

        if (saleError)
            throw saleError;

        //------------------------------------------------
        // PREPARE SALES ITEMS
        //------------------------------------------------

        const items = invoice.items.map(item => ({

            sales_id: saleData.id,

            product_id: item.product_id,

            product_name: item.product_name,

            batch: item.batch,

            expiry: item.expiry,

            pack_size: item.pack_size,

            hsn: item.hsn,

            gst: item.gst,

            qty: item.qty,

            unit: item.unit,

            mrp: item.mrp,

            rate: item.rate,

            discount_percent: item.discount_percent,

            discount_amount: item.discount_amount,

            taxable_amount: item.taxable_amount,

            gst_amount: item.gst_amount,

            amount: item.amount

        }));

        //------------------------------------------------
        // INSERT SALES ITEMS
        //------------------------------------------------

        const { error: itemError } =
            await supabase
                .from("sales_items")
                .insert(items);

        if (itemError)
            throw itemError;

        //------------------------------------------------
        // UPDATE PRODUCT STOCK
        //------------------------------------------------

        for (const item of invoice.items) {

            const product = products.find(p => p.id == item.product_id);

            if (!product)
                continue;

            const newQty = Number(product.quantity) - Number(item.qty);

            const { error } = await supabase

                .from("products")

                .update({

                    quantity: newQty

                })

                .eq("id", item.product_id);

            if (error)
                throw error;

            product.quantity = newQty;

        }

        //------------------------------------------------
        // SUCCESS
        //------------------------------------------------

        hideLoading();

        showToast("Invoice Saved Successfully", "success");

        if (typeof loadDashboard === "function")
            loadDashboard();

        if (typeof loadInvoiceHistory === "function")
            loadInvoiceHistory();

        await newInvoice();

    }

    catch (err) {

        hideLoading();

        console.error(err);

        showToast(err.message || "Unable to save invoice", "danger");

    }

}

// ======================================================
// PART 4B
// HISTORY / PRINT / PDF
// ======================================================

//--------------------------------------------------------
// LOAD DASHBOARD
//--------------------------------------------------------

async function loadDashboard() {

    try {

        const today = new Date().toISOString().split("T")[0];

        // Today's Sales
        const { data: sales } = await supabase
            .from("sales")
            .select("*")
            .eq("invoice_date", today);

        if (!sales)
            return;

        let totalSales = 0;
        let pending = 0;

        sales.forEach(sale => {

            totalSales += Number(sale.grand_total || 0);

            pending += Number(sale.balance_amount || 0);

        });

        DOM.todaySales.textContent = totalSales.toFixed(2);

        DOM.todayInvoices.textContent = sales.length;

        DOM.pendingAmount.textContent = pending.toFixed(2);

    }

    catch (err) {

        console.error(err);

    }

}

//--------------------------------------------------------
// LOAD INVOICE HISTORY
//--------------------------------------------------------

async function loadInvoiceHistory() {

    try {

        const { data, error } = await supabase

            .from("sales")

            .select(`
                *,
                customers(name)
            `)

            .order("id", {

                ascending: false

            })

            .limit(20);

        if (error)
            throw error;

        DOM.invoiceHistory.innerHTML = "";

        if (!data.length) {

            DOM.invoiceHistory.innerHTML =

                `<tr>
                    <td colspan="7" class="text-center">
                        No invoices found
                    </td>
                </tr>`;

            return;

        }

        data.forEach(invoice => {

            DOM.invoiceHistory.innerHTML += `

<tr>

<td>${invoice.invoice_no}</td>

<td>${invoice.invoice_date}</td>

<td>${invoice.customers?.name || ""}</td>

<td>${Number(invoice.grand_total).toFixed(2)}</td>

<td>${invoice.payment_status}</td>

<td>

<button
class="btn btn-sm btn-primary viewInvoice"
data-id="${invoice.id}">

View

</button>

</td>

</tr>

`;

        });

        document

            .querySelectorAll(".viewInvoice")

            .forEach(btn => {

                btn.onclick = () => {

                    viewInvoice(btn.dataset.id);

                };

            });

    }

    catch (err) {

        console.error(err);

        showToast(err.message, "danger");

    }

}

//--------------------------------------------------------
// VIEW INVOICE
//--------------------------------------------------------

async function viewInvoice(id) {

    try {

        const { data: sale } = await supabase

            .from("sales")

            .select("*")

            .eq("id", id)

            .single();

        if (!sale)
            return;

        const { data: items } = await supabase

            .from("sales_items")

            .select("*")

            .eq("sales_id", id);

        console.log(sale);

        console.table(items);

        showToast("Invoice loaded successfully", "success");

        // Full preview UI will be added later

    }

    catch (err) {

        console.error(err);

    }

}

//--------------------------------------------------------
// PRINT
//--------------------------------------------------------

function printInvoice() {

    window.print();

}

//--------------------------------------------------------
// EXPORT PDF
//--------------------------------------------------------

function exportPDF() {

    window.print();

}

//--------------------------------------------------------
// DELETE INVOICE
//--------------------------------------------------------

async function deleteInvoice(id) {

    if (!confirm("Delete this invoice?"))
        return;

    try {

        const { error } = await supabase

            .from("sales")

            .delete()

            .eq("id", id);

        if (error)
            throw error;

        showToast("Invoice Deleted", "success");

        loadInvoiceHistory();

        loadDashboard();

    }

    catch (err) {

        console.error(err);

        showToast(err.message, "danger");

    }

}

// ======================================================
// PART 5A
// PRODUCTIVITY FEATURES
// ======================================================

let invoiceChanged = false;

//-------------------------------------------------------
// MARK CHANGES
//-------------------------------------------------------

function markInvoiceChanged() {
    invoiceChanged = true;
}

function clearInvoiceChanged() {
    invoiceChanged = false;
}

//-------------------------------------------------------
// REGISTER CHANGE EVENTS
//-------------------------------------------------------

function registerDirtyTracking() {

    document.addEventListener("input", () => {
        markInvoiceChanged();
    });

    document.addEventListener("change", () => {
        markInvoiceChanged();
    });

}

//-------------------------------------------------------
// WARN BEFORE LEAVING PAGE
//-------------------------------------------------------

window.addEventListener("beforeunload", function (e) {

    if (!invoiceChanged)
        return;

    e.preventDefault();

    e.returnValue = "";

});

//-------------------------------------------------------
// CLEAR FLAG AFTER SAVE
//-------------------------------------------------------

const originalSaveInvoice = saveInvoice;

saveInvoice = async function () {

    await originalSaveInvoice();

    clearInvoiceChanged();

};

//-------------------------------------------------------
// CLEAR FLAG AFTER NEW
//-------------------------------------------------------

const originalNewInvoice = newInvoice;

newInvoice = async function () {

    if (invoiceChanged) {

        if (!confirm("Discard current invoice?"))
            return;

    }

    await originalNewInvoice();

    clearInvoiceChanged();

};

//-------------------------------------------------------
// KEYBOARD SHORTCUTS
//-------------------------------------------------------

document.addEventListener("keydown", function (e) {

    //------------------------------------
    // Ctrl + S
    //------------------------------------

    if (e.ctrlKey && e.key.toLowerCase() === "s") {

        e.preventDefault();

        saveInvoice();

    }

    //------------------------------------
    // Ctrl + N
    //------------------------------------

    if (e.ctrlKey && e.key.toLowerCase() === "n") {

        e.preventDefault();

        newInvoice();

    }

    //------------------------------------
    // Ctrl + P
    //------------------------------------

    if (e.ctrlKey && e.key.toLowerCase() === "p") {

        e.preventDefault();

        printInvoice();

    }

    //------------------------------------
    // F2 = Add Product Row
    //------------------------------------

    if (e.key === "F2") {

        e.preventDefault();

        addProductRow();

    }

    //------------------------------------
    // Escape
    //------------------------------------

    if (e.key === "Escape") {

        document

            .querySelectorAll(".searchResults")

            .forEach(box => {

                box.style.display = "none";

            });

    }

});

// ======================================================
// PART 5B
// SMART ERP FEATURES
// ======================================================

//-------------------------------------------------------
// LOW STOCK LIMIT
//-------------------------------------------------------

const LOW_STOCK_LIMIT = 5;

//-------------------------------------------------------
// CHECK PRODUCT STATUS
//-------------------------------------------------------

function checkProductStatus(row) {

    const stock = Number(row.dataset.stock || 0);

    const expiryText = row.querySelector(".expiry").value;

    const search = row.querySelector(".productSearch");

    search.classList.remove(
        "border-danger",
        "border-warning",
        "border-success"
    );

    //---------------------------------------
    // LOW STOCK
    //---------------------------------------

    if (stock <= LOW_STOCK_LIMIT) {

        search.classList.add("border-warning");

        showToast(
            `Low Stock (${stock})`,
            "warning"
        );

    }

    //---------------------------------------
    // EXPIRY
    //---------------------------------------

    if (!expiryText)
        return;

    const expiry = new Date(expiryText);

    const today = new Date();

    const diffDays = Math.ceil(

        (expiry - today) /

        (1000 * 60 * 60 * 24)

    );

    //---------------------------------------

    if (diffDays < 0) {

        search.classList.remove("border-warning");

        search.classList.add("border-danger");

        showToast(
            "Expired Batch",
            "danger"
        );

        return;

    }

    //---------------------------------------

    if (diffDays <= 30) {

        search.classList.add("border-warning");

        showToast(
            "Batch Expiring Soon",
            "warning"
        );

    }

}

//-------------------------------------------------------
// DUPLICATE PRODUCT CHECK
//-------------------------------------------------------

function checkDuplicateProduct(row) {

    const id = row.dataset.productId;

    if (!id)
        return false;

    let count = 0;

    document

        .querySelectorAll("tr.product-row")

        .forEach(r => {

            if (r.dataset.productId === id)

                count++;

        });

    if (count > 1) {

        showToast(

            "Same product already exists in invoice",

            "warning"

        );

        return true;

    }

    return false;

}

//-------------------------------------------------------
// AUTO NEXT FIELD
//-------------------------------------------------------

function autoMoveNext(row) {

    const qty = row.querySelector(".qty");

    qty.addEventListener("keydown", e => {

        if (e.key !== "Enter")
            return;

        e.preventDefault();

        const rows = [

            ...document.querySelectorAll(

                "tr.product-row"

            )

        ];

        const index = rows.indexOf(row);

        //----------------------------------

        if (index === rows.length - 1) {

            addProductRow();

            setTimeout(() => {

                const last =

                    document

                    .querySelectorAll(

                        "tr.product-row"

                    );

                last[last.length - 1]

                    .querySelector(

                        ".productSearch"

                    )

                    .focus();

            }, 50);

        }

        else {

            rows[index + 1]

                .querySelector(

                    ".productSearch"

                )

                .focus();

        }

    });

}

//-------------------------------------------------------
// ROW READY
//-------------------------------------------------------

function enhanceRow(row) {

    checkProductStatus(row);

    checkDuplicateProduct(row);

    autoMoveNext(row);

}

//-------------------------------------------------------
// PATCH SELECT PRODUCT
//-------------------------------------------------------

const originalSelectProduct = selectProduct;

selectProduct = function (row, product) {

    originalSelectProduct(row, product);

    enhanceRow(row);

};

//-------------------------------------------------------
// PRINT VALIDATION
//-------------------------------------------------------

const originalPrint = printInvoice;

printInvoice = function () {

    if (!validateInvoice())
        return;

    originalPrint();

};

//-------------------------------------------------------
// SAVE VALIDATION
//-------------------------------------------------------

const oldSave = saveInvoice;

saveInvoice = async function () {

    document

        .querySelectorAll("tr.product-row")

        .forEach(row => {

            if (!row.dataset.productId)

                throw "Invalid Product";

        });

    await oldSave();

};
