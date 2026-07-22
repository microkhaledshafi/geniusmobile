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
