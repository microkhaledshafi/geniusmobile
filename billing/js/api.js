/*
==========================================================
Genius Scientific ERP
Billing Module

File:
api.js

Purpose:
Centralized Data Access Layer (DAL)

Responsibilities:
• Supabase communication
• CRUD operations
• Error handling
• Response normalization

Every database request must pass through this file.

==========================================================
*/

import { supabase } from "../supabase.js";

/*==========================================================
Constants
==========================================================*/

const DEFAULT_LIMIT = 10;

/*==========================================================
Execute Query
==========================================================*/

async function execute(queryPromise) {

    try {

        const { data, error } = await queryPromise;

        if (error) {

            throw error;

        }

        return data;

    }

    catch (error) {

        console.error(

            "[API]",

            error

        );

        throw error;

    }

}

/*==========================================================
Return First Row
==========================================================*/

function first(data) {

    if (!Array.isArray(data)) {

        return null;

    }

    return data.length > 0
        ? data[0]
        : null;

}

/*==========================================================
Return Safe Array
==========================================================*/

function safeArray(data) {

    if (!Array.isArray(data)) {

        return [];

    }

    return data;

}

/*==========================================================
Validate ID
==========================================================*/

function validateId(id) {

    if (id === null || id === undefined) {

        throw new Error("Invalid ID.");

    }

}

/*==========================================================
Validate Object
==========================================================*/

function validateObject(value) {

    if (

        typeof value !== "object" ||

        value === null

    ) {

        throw new Error("Invalid object.");

    }

}

/*==========================================================
Export Helpers
==========================================================*/

export {

    execute,

    first,

    safeArray,

    validateId,

    validateObject,

    DEFAULT_LIMIT

};

/*==========================================================
Customer APIs
==========================================================*/

/**
 * Search customers by name or phone
 */
export async function searchCustomers(search = "", limit = DEFAULT_LIMIT) {

    const keyword = search.trim();

    let query = supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true })
        .limit(limit);

    if (keyword !== "") {

        query = query.or(
            `name.ilike.%${keyword}%,phone.ilike.%${keyword}%`
        );

    }

    return safeArray(
        await execute(query)
    );

}

/**
 * Get customer by ID
 */
export async function getCustomerById(id) {

    validateId(id);

    const data = await execute(

        supabase
            .from("customers")
            .select("*")
            .eq("id", id)

    );

    return first(data);

}

/**
 * Add customer
 */
export async function addCustomer(customer) {

    validateObject(customer);

    const data = await execute(

        supabase
            .from("customers")
            .insert([customer])
            .select()

    );

    return first(data);

}

/**
 * Update customer
 */
export async function updateCustomer(id, customer) {

    validateId(id);
    validateObject(customer);

    const data = await execute(

        supabase
            .from("customers")
            .update(customer)
            .eq("id", id)
            .select()

    );

    return first(data);

}

/**
 * Delete customer
 */
export async function deleteCustomer(id) {

    validateId(id);

    await execute(

        supabase
            .from("customers")
            .delete()
            .eq("id", id)

    );

    return true;

}

/**
 * Get all customers
 */
export async function getCustomers(limit = 1000) {

    const data = await execute(

        supabase
            .from("customers")
            .select("*")
            .order("name", { ascending: true })
            .limit(limit)

    );

    return safeArray(data);

}

/**
 * Check whether customer exists
 */
export async function customerExists(phone) {

    if (!phone) {

        return false;

    }

    const data = await execute(

        supabase
            .from("customers")
            .select("id")
            .eq("phone", phone)
            .limit(1)

    );

    return data.length > 0;

}
/*==========================================================
Product APIs
==========================================================*/

/**
 * Search products by name, barcode or HSN code
 */
export async function searchProducts(search = "", limit = DEFAULT_LIMIT) {

    const keyword = search.trim();

    let query = supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true })
        .limit(limit);

    if (keyword !== "") {

        query = query.or(
            `name.ilike.%${keyword}%,barcode.ilike.%${keyword}%,hsn_code.ilike.%${keyword}%`
        );

    }

    return safeArray(
        await execute(query)
    );

}

/**
 * Get product by ID
 */
export async function getProductById(id) {

    validateId(id);

    const data = await execute(

        supabase
            .from("products")
            .select("*")
            .eq("id", id)

    );

    return first(data);

}

/**
 * Get product by barcode
 */
export async function getProductByBarcode(barcode) {

    if (!barcode) {

        return null;

    }

    const data = await execute(

        supabase
            .from("products")
            .select("*")
            .eq("barcode", barcode)
            .limit(1)

    );

    return first(data);

}

/**
 * Add product
 */
export async function addProduct(product) {

    validateObject(product);

    const data = await execute(

        supabase
            .from("products")
            .insert([product])
            .select()

    );

    return first(data);

}

/**
 * Update product
 */
export async function updateProduct(id, product) {

    validateId(id);
    validateObject(product);

    const data = await execute(

        supabase
            .from("products")
            .update(product)
            .eq("id", id)
            .select()

    );

    return first(data);

}

/**
 * Delete product
 */
export async function deleteProduct(id) {

    validateId(id);

    await execute(

        supabase
            .from("products")
            .delete()
            .eq("id", id)

    );

    return true;

}

/**
 * Get all products
 */
export async function getProducts(limit = 1000) {

    const data = await execute(

        supabase
            .from("products")
            .select("*")
            .order("name", { ascending: true })
            .limit(limit)

    );

    return safeArray(data);

}

/**
 * Update product stock
 */
export async function updateProductStock(id, quantity) {

    validateId(id);

    const product = await getProductById(id);

    if (!product) {

        throw new Error("Product not found.");

    }

    const currentStock = Number(product.stock || 0);

    const data = await execute(

        supabase
            .from("products")
            .update({

                stock: currentStock + Number(quantity)

            })
            .eq("id", id)
            .select()

    );

    return first(data);

}

/**
 * Set product stock
 */
export async function setProductStock(id, stock) {

    validateId(id);

    const data = await execute(

        supabase
            .from("products")
            .update({

                stock: Number(stock)

            })
            .eq("id", id)
            .select()

    );

    return first(data);

}

/**
 * Check whether product exists
 */
export async function productExists(barcode) {

    if (!barcode) {

        return false;

    }

    const data = await execute(

        supabase
            .from("products")
            .select("id")
            .eq("barcode", barcode)
            .limit(1)

    );

    return data.length > 0;

}
/*==========================================================
Sales APIs
==========================================================*/

/**
 * Get next invoice number
 */
export async function getNextInvoiceNumber() {

    const data = await execute(

        supabase
            .from("sales")
            .select("invoice_no")
            .order("invoice_no", { ascending: false })
            .limit(1)

    );

    const sale = first(data);

    if (!sale) {

        return 1;

    }

    return Number(sale.invoice_no) + 1;

}

/**
 * Save Sale (Master)
 */
export async function saveSale(sale) {

    validateObject(sale);

    const data = await execute(

        supabase
            .from("sales")
            .insert([sale])
            .select()

    );

    return first(data);

}

/**
 * Save Sale Items
 */
export async function saveSaleItems(items = []) {

    if (!Array.isArray(items)) {

        throw new Error("Invalid sale items.");

    }

    if (items.length === 0) {

        return [];

    }

    return await execute(

        supabase
            .from("sales_items")
            .insert(items)
            .select()

    );

}

/**
 * Save Payment
 */
export async function savePayment(payment) {

    validateObject(payment);

    const data = await execute(

        supabase
            .from("payments")
            .insert([payment])
            .select()

    );

    return first(data);

}

/**
 * Get Sale
 */
export async function getSale(id) {

    validateId(id);

    const data = await execute(

        supabase
            .from("sales")
            .select("*")
            .eq("id", id)

    );

    return first(data);

}

/**
 * Get Sale Items
 */
export async function getSaleItems(saleId) {

    validateId(saleId);

    const data = await execute(

        supabase
            .from("sales_items")
            .select("*")
            .eq("sale_id", saleId)
            .order("id")

    );

    return safeArray(data);

}

/**
 * Get Sale With Items
 */
export async function getSaleWithItems(id) {

    const sale = await getSale(id);

    if (!sale) {

        return null;

    }

    sale.items = await getSaleItems(id);

    return sale;

}

/**
 * Update Sale
 */
export async function updateSale(id, values) {

    validateId(id);

    validateObject(values);

    const data = await execute(

        supabase
            .from("sales")
            .update(values)
            .eq("id", id)
            .select()

    );

    return first(data);

}

/**
 * Delete Sale Items
 */
export async function deleteSaleItems(saleId) {

    validateId(saleId);

    await execute(

        supabase
            .from("sales_items")
            .delete()
            .eq("sale_id", saleId)

    );

    return true;

}

/**
 * Delete Sale
 */
export async function deleteSale(id) {

    validateId(id);

    await deleteSaleItems(id);

    await execute(

        supabase
            .from("payments")
            .delete()
            .eq("sale_id", id)

    );

    await execute(

        supabase
            .from("sales")
            .delete()
            .eq("id", id)

    );

    return true;

}

/**
 * Sales History
 */
export async function getSalesHistory(limit = 100) {

    const data = await execute(

        supabase
            .from("sales")
            .select("*")
            .order("created_at", {

                ascending: false

            })
            .limit(limit)

    );

    return safeArray(data);

}

/**
 * Sales Between Dates
 */
export async function getSalesBetweenDates(from, to) {

    const data = await execute(

        supabase
            .from("sales")
            .select("*")
            .gte("created_at", from)
            .lte("created_at", to)
            .order("created_at", {

                ascending: false

            })

    );

    return safeArray(data);

}
/*==========================================================
Purchase APIs
==========================================================*/

/**
 * Save Purchase Master
 */
export async function savePurchase(purchase) {

    validateObject(purchase);

    const data = await execute(

        supabase
            .from("purchase_master")
            .insert([purchase])
            .select()

    );

    return first(data);

}

/**
 * Save Purchase Items
 */
export async function savePurchaseItems(items = []) {

    if (!Array.isArray(items)) {

        throw new Error("Invalid purchase items.");

    }

    if (items.length === 0) {

        return [];

    }

    return await execute(

        supabase
            .from("purchase_items")
            .insert(items)
            .select()

    );

}

/**
 * Get Purchase
 */
export async function getPurchase(id) {

    validateId(id);

    const data = await execute(

        supabase
            .from("purchase_master")
            .select("*")
            .eq("id", id)

    );

    return first(data);

}

/**
 * Get Purchase Items
 */
export async function getPurchaseItems(purchaseId) {

    validateId(purchaseId);

    const data = await execute(

        supabase
            .from("purchase_items")
            .select("*")
            .eq("purchase_id", purchaseId)
            .order("id")

    );

    return safeArray(data);

}

/**
 * Get Purchase With Items
 */
export async function getPurchaseWithItems(id) {

    const purchase = await getPurchase(id);

    if (!purchase) {

        return null;

    }

    purchase.items = await getPurchaseItems(id);

    return purchase;

}

/**
 * Update Purchase
 */
export async function updatePurchase(id, values) {

    validateId(id);

    validateObject(values);

    const data = await execute(

        supabase
            .from("purchase_master")
            .update(values)
            .eq("id", id)
            .select()

    );

    return first(data);

}

/**
 * Delete Purchase Items
 */
export async function deletePurchaseItems(purchaseId) {

    validateId(purchaseId);

    await execute(

        supabase
            .from("purchase_items")
            .delete()
            .eq("purchase_id", purchaseId)

    );

    return true;

}

/**
 * Delete Purchase
 */
export async function deletePurchase(id) {

    validateId(id);

    await deletePurchaseItems(id);

    await execute(

        supabase
            .from("purchase_master")
            .delete()
            .eq("id", id)

    );

    return true;

}

/**
 * Purchase History
 */
export async function getPurchaseHistory(limit = 100) {

    const data = await execute(

        supabase
            .from("purchase_master")
            .select("*")
            .order("created_at", {

                ascending: false

            })
            .limit(limit)

    );

    return safeArray(data);

}

/**
 * Purchases Between Dates
 */
export async function getPurchasesBetweenDates(from, to) {

    const data = await execute(

        supabase
            .from("purchase_master")
            .select("*")
            .gte("created_at", from)
            .lte("created_at", to)
            .order("created_at", {

                ascending: false

            })

    );

    return safeArray(data);

}

/**
 * Save Supplier Ledger Entry
 */
export async function saveSupplierLedger(entry) {

    validateObject(entry);

    const data = await execute(

        supabase
            .from("supplier_ledger")
            .insert([entry])
            .select()

    );

    return first(data);

}

/**
 * Get Supplier Ledger
 */
export async function getSupplierLedger(supplierId) {

    validateId(supplierId);

    const data = await execute(

        supabase
            .from("supplier_ledger")
            .select("*")
            .eq("supplier_id", supplierId)
            .order("created_at", {

                ascending: false

            })

    );

    return safeArray(data);

}
/*==========================================================
Dashboard APIs
==========================================================*/

/**
 * Total Customers
 */
export async function getCustomerCount() {

    const { count, error } = await supabase
        .from("customers")
        .select("*", {

            count: "exact",
            head: true

        });

    if (error) {

        throw error;

    }

    return count || 0;

}

/**
 * Total Products
 */
export async function getProductCount() {

    const { count, error } = await supabase
        .from("products")
        .select("*", {

            count: "exact",
            head: true

        });

    if (error) {

        throw error;

    }

    return count || 0;

}

/**
 * Total Suppliers
 */
export async function getSupplierCount() {

    const { count, error } = await supabase
        .from("suppliers")
        .select("*", {

            count: "exact",
            head: true

        });

    if (error) {

        throw error;

    }

    return count || 0;

}

/**
 * Total Sales
 */
export async function getSalesCount() {

    const { count, error } = await supabase
        .from("sales")
        .select("*", {

            count: "exact",
            head: true

        });

    if (error) {

        throw error;

    }

    return count || 0;

}

/**
 * Total Purchases
 */
export async function getPurchaseCount() {

    const { count, error } = await supabase
        .from("purchase_master")
        .select("*", {

            count: "exact",
            head: true

        });

    if (error) {

        throw error;

    }

    return count || 0;

}

/**
 * Recent Sales
 */
export async function getRecentSales(limit = 10) {

    const data = await execute(

        supabase
            .from("sales")
            .select("*")
            .order("created_at", {

                ascending: false

            })
            .limit(limit)

    );

    return safeArray(data);

}

/**
 * Recent Purchases
 */
export async function getRecentPurchases(limit = 10) {

    const data = await execute(

        supabase
            .from("purchase_master")
            .select("*")
            .order("created_at", {

                ascending: false

            })
            .limit(limit)

    );

    return safeArray(data);

}

/**
 * Low Stock Products
 */
export async function getLowStockProducts(limit = 20) {

    const data = await execute(

        supabase
            .from("products")
            .select("*")
            .lte("stock", 10)
            .order("stock", {

                ascending: true

            })
            .limit(limit)

    );

    return safeArray(data);

}

/**
 * Dashboard Summary
 */
export async function getDashboardSummary() {

    const [

        customers,
        products,
        suppliers,
        sales,
        purchases

    ] = await Promise.all([

        getCustomerCount(),
        getProductCount(),
        getSupplierCount(),
        getSalesCount(),
        getPurchaseCount()

    ]);

    return {

        customers,
        products,
        suppliers,
        sales,
        purchases

    };

}
/*==========================================================
Utilities
==========================================================*/

/**
 * Get application setting
 */
export async function getSetting(key) {

    if (!key) {

        return null;

    }

    const data = await execute(

        supabase
            .from("settings")
            .select("*")
            .eq("key", key)
            .limit(1)

    );

    return first(data);

}

/**
 * Save application setting
 */
export async function setSetting(key, value) {

    if (!key) {

        throw new Error("Invalid setting key.");

    }

    const existing = await getSetting(key);

    if (existing) {

        const data = await execute(

            supabase
                .from("settings")
                .update({

                    value

                })
                .eq("key", key)
                .select()

        );

        return first(data);

    }

    const data = await execute(

        supabase
            .from("settings")
            .insert([{

                key,
                value

            }])
            .select()

    );

    return first(data);

}

/**
 * Delete setting
 */
export async function deleteSetting(key) {

    if (!key) {

        return false;

    }

    await execute(

        supabase
            .from("settings")
            .delete()
            .eq("key", key)

    );

    return true;

}

/**
 * Get attachment list
 */
export async function getAttachments(recordId, moduleName) {

    validateId(recordId);

    const data = await execute(

        supabase
            .from("attachments")
            .select("*")
            .eq("record_id", recordId)
            .eq("module", moduleName)
            .order("created_at", {

                ascending: false

            })

    );

    return safeArray(data);

}

/**
 * Save attachment
 */
export async function saveAttachment(file) {

    validateObject(file);

    const data = await execute(

        supabase
            .from("attachments")
            .insert([file])
            .select()

    );

    return first(data);

}

/**
 * Delete attachment
 */
export async function deleteAttachment(id) {

    validateId(id);

    await execute(

        supabase
            .from("attachments")
            .delete()
            .eq("id", id)

    );

    return true;

}

/**
 * Generic lookup by ID
 */
export async function findById(table, id) {

    validateId(id);

    const data = await execute(

        supabase
            .from(table)
            .select("*")
            .eq("id", id)
            .limit(1)

    );

    return first(data);

}

/**
 * Generic delete by ID
 */
export async function deleteById(table, id) {

    validateId(id);

    await execute(

        supabase
            .from(table)
            .delete()
            .eq("id", id)

    );

    return true;

}

/**
 * Generic record count
 */
export async function getRecordCount(table) {

    const { count, error } = await supabase
        .from(table)
        .select("*", {

            count: "exact",
            head: true

        });

    if (error) {

        throw error;

    }

    return count || 0;

}

/**
 * Health check
 */
export async function pingDatabase() {

    await execute(

        supabase
            .from("settings")
            .select("id")
            .limit(1)

    );

    return true;

}

