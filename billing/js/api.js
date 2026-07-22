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
