/*
==========================================================
Genius Scientific ERP
Billing Module
utils.js
==========================================================
Shared utility functions
==========================================================
*/

/*----------------------------------------------------------
DOM
----------------------------------------------------------*/

export function qs(selector) {
    return document.querySelector(selector);
}

export function qsa(selector) {
    return document.querySelectorAll(selector);
}

/*----------------------------------------------------------
Date
----------------------------------------------------------*/

export function today() {
    return new Date().toISOString().split("T")[0];
}

export function formatDate(value) {
    if (!value) return "";

    const d = new Date(value);

    if (isNaN(d.getTime())) return "";

    return d.toISOString().split("T")[0];
}

/*----------------------------------------------------------
Numbers
----------------------------------------------------------*/

export function toNumber(value) {
    const n = Number(value);

    return isNaN(n) ? 0 : n;
}

export function round(value, digits = 2) {
    const factor = Math.pow(10, digits);

    return Math.round(toNumber(value) * factor) / factor;
}

export function money(value) {
    return round(value).toFixed(2);
}

export function formatCurrency(value) {
    return money(value);
}

/*----------------------------------------------------------
Validation
----------------------------------------------------------*/

export function isEmpty(value) {
    return (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    );
}

export function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

/*----------------------------------------------------------
String
----------------------------------------------------------*/

export function sanitizeString(value) {
    return String(value ?? "").trim();
}

export function capitalize(text) {
    if (isEmpty(text)) return "";

    return text
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
}

export function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

/*----------------------------------------------------------
Array
----------------------------------------------------------*/

export function unique(array) {
    return [...new Set(array)];
}

export function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

/*----------------------------------------------------------
Debounce
----------------------------------------------------------*/

export function debounce(fn, delay = 300) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            fn(...args);

        }, delay);

    };

}

/*----------------------------------------------------------
Random
----------------------------------------------------------*/

export function generateId(prefix = "") {

    return (
        prefix +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8)
    );

}

/*----------------------------------------------------------
Math
----------------------------------------------------------*/

export function percentage(value, percent) {
    return toNumber(value) * toNumber(percent) / 100;
}

export function calculateTax(amount, taxRate) {
    return percentage(amount, taxRate);
}

/*----------------------------------------------------------
Sleep
----------------------------------------------------------*/

export function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}
