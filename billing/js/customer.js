/*
=========================================================
Genius Scientific ERP
customer.js
=========================================================
Customer Management Module
=========================================================
*/

import { supabase } from "../supabase.js";
import { state } from "./state.js";
import {
    qs,
    sanitizeString,
    isEmpty
} from "./utils.js";

import {
    showSuccess,
    showError
} from "./notifications.js";

/*=========================================================
DOM
=========================================================*/

const customerSelect = () => qs("#customer");
const gstInput = () => qs("#customerGST");
const phoneInput = () => qs("#customerPhone");
const addressInput = () => qs("#customerAddress");

/*=========================================================
LOAD CUSTOMERS
=========================================================*/

export async function loadCustomers() {

    try {

        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .order("customer_name");

        if (error)
            throw error;

        state.customers = data || [];

        populateCustomerDropdown();

    }

    catch (err) {

        console.error(err);

        showError(err.message);

    }

}

/*=========================================================
POPULATE DROPDOWN
=========================================================*/

export function populateCustomerDropdown() {

    const select = customerSelect();

    if (!select)
        return;

    select.innerHTML = "";

    const option = document.createElement("option");

    option.value = "";

    option.textContent = "Select Customer";

    select.appendChild(option);

    state.customers.forEach(customer => {

        const opt = document.createElement("option");

        opt.value = customer.id;

        opt.textContent = customer.customer_name;

        select.appendChild(opt);

    });

}

/*=========================================================
GET CUSTOMER
=========================================================*/

export function getCustomer(id) {

    return state.customers.find(customer =>

        Number(customer.id) === Number(id)

    );

}

/*=========================================================
SELECT CUSTOMER
=========================================================*/

export function selectCustomer(id) {

    if (isEmpty(id)) {

        clearCustomer();

        return;

    }

    const customer = getCustomer(id);

    if (!customer)
        return;

    state.customer = customer;

    fillCustomer(customer);

}

/*=========================================================
FILL DETAILS
=========================================================*/

export function fillCustomer(customer) {

    gstInput().value =
        customer.gstin || "";

    phoneInput().value =
        customer.phone || "";

    addressInput().value =
        customer.address || "";

}

/*=========================================================
CLEAR
=========================================================*/

export function clearCustomer() {

    customerSelect().value = "";

    gstInput().value = "";

    phoneInput().value = "";

    addressInput().value = "";

    state.customer = null;

}

/*=========================================================
SEARCH
=========================================================*/

export function searchCustomer(keyword) {

    keyword = sanitizeString(keyword).toLowerCase();

    if (keyword === "")
        return state.customers;

    return state.customers.filter(customer =>

        customer.customer_name
            ?.toLowerCase()
            .includes(keyword)

        ||

        customer.phone
            ?.toLowerCase()
            .includes(keyword)

        ||

        customer.gstin
            ?.toLowerCase()
            .includes(keyword)

    );

}

/*=========================================================
ADD CUSTOMER
=========================================================*/

export async function addCustomer(customer) {

    try {

        const { data, error } = await supabase

            .from("customers")

            .insert(customer)

            .select()

            .single();

        if (error)
            throw error;

        state.customers.push(data);

        populateCustomerDropdown();

        customerSelect().value = data.id;

        selectCustomer(data.id);

        showSuccess("Customer added successfully");

        return data;

    }

    catch (err) {

        console.error(err);

        showError(err.message);

        return null;

    }

}

/*=========================================================
UPDATE CUSTOMER
=========================================================*/

export async function updateCustomer(id, customer) {

    try {

        const { data, error } = await supabase

            .from("customers")

            .update(customer)

            .eq("id", id)

            .select()

            .single();

        if (error)
            throw error;

        const index = state.customers.findIndex(

            c => Number(c.id) === Number(id)

        );

        if (index >= 0)

            state.customers[index] = data;

        populateCustomerDropdown();

        selectCustomer(id);

        showSuccess("Customer updated");

    }

    catch (err) {

        console.error(err);

        showError(err.message);

    }

}

/*=========================================================
DELETE CUSTOMER
=========================================================*/

export async function deleteCustomer(id) {

    if (!confirm("Delete this customer?"))
        return;

    try {

        const { error } = await supabase

            .from("customers")

            .delete()

            .eq("id", id);

        if (error)
            throw error;

        state.customers =

            state.customers.filter(

                c => Number(c.id) !== Number(id)

            );

        clearCustomer();

        populateCustomerDropdown();

        showSuccess("Customer deleted");

    }

    catch (err) {

        console.error(err);

        showError(err.message);

    }

}

/*=========================================================
EVENTS
=========================================================*/

function registerEvents() {

    customerSelect()?.addEventListener(

        "change",

        e => {

            selectCustomer(e.target.value);

        }

    );

}

/*=========================================================
INIT
=========================================================*/

export function initCustomer() {

    registerEvents();

}
