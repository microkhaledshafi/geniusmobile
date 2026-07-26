/* ==========================================================
   Genius Scientific ERP
   api.js
   Part 1
   Data Access Layer
========================================================== */

import { supabase } from "../supabase.js";

let initialized = false;

/* ==========================================================
   Initialize API
========================================================== */

export function initializeAPI() {

    if (initialized) return;

    initialized = true;

    console.log("[API] Initialized");

}

/* ==========================================================
   Execute Query
========================================================== */

async function execute(query) {

    const { data, error } = await query;

    if (error) {

        console.error("[API]", error);

        throw error;

    }

    return data;

}

/* ==========================================================
   Execute Single Row Query
========================================================== */

async function executeSingle(query) {

    const { data, error } = await query.single();

    if (error) {

        console.error("[API]", error);

        throw error;

    }

    return data;

}

/* ==========================================================
   Execute Maybe Single Row Query
========================================================== */

async function executeMaybeSingle(query) {

    const { data, error } = await query.maybeSingle();

    if (error) {

        console.error("[API]", error);

        throw error;

    }

    return data;

}

/* ==========================================================
   Health Check
========================================================== */

export async function healthCheck() {

    try {

        await execute(

            supabase
                .from("products")
                .select("id")
                .limit(1)

        );

        return true;

    }

    catch (error) {

        return false;

    }

}

/* ==========================================================
   Test Database Connection
========================================================== */

export async function testConnection() {

    return healthCheck();

}

/* ==========================================================
   Generic Count
========================================================== */

export async function getCount(table) {

    const { count, error } = await supabase

        .from(table)

        .select("*", {

            count: "exact",

            head: true

        });

    if (error) {

        console.error("[API]", error);

        throw error;

    }

    return count || 0;

}

/* ==========================================================
   Invoice APIs
========================================================== */

/**
 * Create Invoice
 */
export async function createInvoice(invoice) {

    return executeSingle(

        supabase
            .from("invoices")
            .insert(invoice)
            .select()

    );

}

/**
 * Update Invoice
 */
export async function updateInvoice(
    invoiceId,
    invoice
) {

    return executeSingle(

        supabase
            .from("invoices")
            .update(invoice)
            .eq("id", invoiceId)
            .select()

    );

}

/**
 * Get Invoice
 */
export async function getInvoice(invoiceId) {

    return executeMaybeSingle(

        supabase
            .from("invoices")
            .select("*")
            .eq("id", invoiceId)

    );

}

/**
 * Get All Invoices
 */
export async function getInvoices() {

    return execute(

        supabase
            .from("invoices")
            .select("*")
            .order("invoice_date", {
                ascending: false
            })

    );

}

/**
 * Delete Invoice
 */
export async function deleteInvoice(invoiceId) {

    await execute(

        supabase
            .from("invoices")
            .delete()
            .eq("id", invoiceId)

    );

}

/* ==========================================================
   Invoice Item APIs
========================================================== */

/**
 * Create Invoice Items
 */
export async function createInvoiceItems(items) {

    return execute(

        supabase
            .from("invoice_items")
            .insert(items)

    );

}

/**
 * Get Invoice Items
 */
export async function getInvoiceItems(invoiceId) {

    return execute(

        supabase
            .from("invoice_items")
            .select("*")
            .eq("invoice_id", invoiceId)
            .order("id")

    );

}

/**
 * Delete Invoice Items
 */
export async function deleteInvoiceItems(invoiceId) {

    await execute(

        supabase
            .from("invoice_items")
            .delete()
            .eq("invoice_id", invoiceId)

    );

}

/**
 * Replace Invoice Items
 *
 * Used while editing invoices.
 */
export async function replaceInvoiceItems(
    invoiceId,
    items
) {

    await deleteInvoiceItems(invoiceId);

    if (!items.length)
        return [];

    return createInvoiceItems(items);

}

/* ==========================================================
   Customer APIs
========================================================== */

/**
 * Create Customer
 */
export async function createCustomer(customer) {

    return executeSingle(

        supabase
            .from("customers")
            .insert(customer)
            .select()

    );

}

/**
 * Update Customer
 */
export async function updateCustomer(
    customerId,
    customer
) {

    return executeSingle(

        supabase
            .from("customers")
            .update(customer)
            .eq("id", customerId)
            .select()

    );

}

/**
 * Get Customer
 */
export async function getCustomer(customerId) {

    return executeMaybeSingle(

        supabase
            .from("customers")
            .select("*")
            .eq("id", customerId)

    );

}

/**
 * Search Customers
 */
export async function searchCustomers(search = "") {

    const term = search.trim();

    if (!term) {

        return execute(

            supabase
                .from("customers")
                .select("*")
                .order("name")
                .limit(50)

        );

    }

    return execute(

        supabase
            .from("customers")
            .select("*")
            .or(
                `name.ilike.%${term}%,phone.ilike.%${term}%`
            )
            .order("name")
            .limit(50)

    );

}

/**
 * Get All Customers
 */
export async function getCustomers() {

    return execute(

        supabase
            .from("customers")
            .select("*")
            .order("name")

    );

}

/* ==========================================================
   Product APIs
========================================================== */

/**
 * Get Products
 */
export async function getProducts(limit = 100) {

    return execute(

        supabase
            .from("products")
            .select("*")
            .order("product_name")
            .limit(limit)

    );

}

/**
 * Get Product
 */
export async function getProduct(productId) {

    return executeMaybeSingle(

        supabase
            .from("products")
            .select("*")
            .eq("id", productId)

    );

}

/**
 * Search Products
 */
export async function searchProducts(search = "") {

    const term = search.trim();

    if (!term) {

        return getProducts();

    }

    return execute(

        supabase
            .from("products")
            .select("*")
            .or(
                `product_name.ilike.%${term}%,
                 barcode.ilike.%${term}%,
                 hsn_code.ilike.%${term}%`
            )
            .order("product_name")
            .limit(100)

    );

}

/**
 * Get Product By Barcode
 */
export async function getProductByBarcode(barcode) {

    return executeMaybeSingle(

        supabase
            .from("products")
            .select("*")
            .eq("barcode", barcode)

    );

}

/* ==========================================================
   Dashboard APIs
========================================================== */

/**
 * Dashboard Summary
 */
export async function getDashboardSummary() {

    const [
        invoiceCount,
        customerCount,
        productCount
    ] = await Promise.all([

        getCount("invoices"),

        getCount("customers"),

        getCount("products")

    ]);

    return {

        invoiceCount,

        customerCount,

        productCount

    };

}

/**
 * Today's Sales
 */
export async function getTodaySales() {

    const today = new Date()
        .toISOString()
        .split("T")[0];

    return execute(

        supabase

            .from("invoices")

            .select("*")

            .eq("invoice_date", today)

    );

}

/**
 * Monthly Sales
 */
export async function getMonthlySales(year, month) {

    const start = `${year}-${String(month).padStart(2, "0")}-01`;

    const end = new Date(year, month, 0)
        .toISOString()
        .split("T")[0];

    return execute(

        supabase

            .from("invoices")

            .select("*")

            .gte("invoice_date", start)

            .lte("invoice_date", end)

    );

}

/**
 * Recent Invoices
 */
export async function getRecentInvoices(limit = 10) {

    return execute(

        supabase

            .from("invoices")

            .select("*")

            .order("invoice_date", {
                ascending: false
            })

            .limit(limit)

    );

}

/* ==========================================================
   Public API
========================================================== */

export default {

    initializeAPI,

    healthCheck,

    testConnection,

    getCount,

    createInvoice,
    updateInvoice,
    getInvoice,
    getInvoices,
    deleteInvoice,

    createInvoiceItems,
    getInvoiceItems,
    deleteInvoiceItems,
    replaceInvoiceItems,

    createCustomer,
    updateCustomer,
    getCustomer,
    getCustomers,
    searchCustomers,

    getProducts,
    getProduct,
    getProductByBarcode,
    searchProducts,

    getDashboardSummary,
    getTodaySales,
    getMonthlySales,
    getRecentInvoices

};
