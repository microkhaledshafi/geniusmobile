/*
=========================================================
Genius Scientific ERP
utils.js
=========================================================
Common Utility Functions
=========================================================
*/

/*---------------------------------------------------------
DOM HELPERS
---------------------------------------------------------*/

export const qs = (selector, parent = document) =>
    parent.querySelector(selector);

export const qsa = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

/*---------------------------------------------------------
DATE HELPERS
---------------------------------------------------------*/

export function today() {
    return new Date().toISOString().split("T")[0];
}

export function formatDate(date) {

    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

}

/*---------------------------------------------------------
NUMBER HELPERS
---------------------------------------------------------*/

export function parseNumber(value) {

    if (value === null || value === undefined || value === "")
        return 0;

    const num = Number(String(value).replace(/,/g, ""));

    return isNaN(num) ? 0 : num;

}

export function round2(value) {

    return Math.round((parseNumber(value) + Number.EPSILON) * 100) / 100;

}

export function formatNumber(value, decimals = 2) {

    return round2(value).toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });

}

export function money(value) {

    return formatNumber(value, 2);

}

/*---------------------------------------------------------
TEXT HELPERS
---------------------------------------------------------*/

export function isEmpty(value) {

    return (
        value === null ||
        value === undefined ||
        value === ""
    );

}

export function sanitizeString(value) {

    return String(value ?? "").trim();

}

export function capitalize(text) {

    return String(text)
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());

}

/*---------------------------------------------------------
ID
---------------------------------------------------------*/

export function uuid() {

    if (crypto.randomUUID)
        return crypto.randomUUID();

    return Date.now().toString(36) +
        Math.random().toString(36).substring(2);

}

/*---------------------------------------------------------
MATH
---------------------------------------------------------*/

export function percentage(value, percent) {

    return round2(parseNumber(value) * parseNumber(percent) / 100);

}

export function clamp(value, min, max) {

    return Math.min(max, Math.max(min, value));

}

/*---------------------------------------------------------
ARRAY
---------------------------------------------------------*/

export function sum(array, key = null) {

    if (!Array.isArray(array))
        return 0;

    if (!key)
        return array.reduce((a, b) => a + parseNumber(b), 0);

    return array.reduce((a, b) => a + parseNumber(b[key]), 0);

}

/*---------------------------------------------------------
DEBOUNCE
---------------------------------------------------------*/

export function debounce(callback, delay = 300) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            callback(...args);

        }, delay);

    };

}

/*---------------------------------------------------------
COPY
---------------------------------------------------------*/

export function deepCopy(object) {

    return JSON.parse(JSON.stringify(object));

}

/*---------------------------------------------------------
LOCAL STORAGE
---------------------------------------------------------*/

export function saveLocal(key, value) {

    localStorage.setItem(key, JSON.stringify(value));

}

export function loadLocal(key, defaultValue = null) {

    const data = localStorage.getItem(key);

    if (!data)
        return defaultValue;

    return JSON.parse(data);

}

/*---------------------------------------------------------
INPUT
---------------------------------------------------------*/

export function onlyNumbers(value) {

    return String(value).replace(/[^\d.]/g, "");

}

/*---------------------------------------------------------
WAIT
---------------------------------------------------------*/

export function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}

/*---------------------------------------------------------
BOOLEAN
---------------------------------------------------------*/

export function yesNo(value) {

    return value ? "Yes" : "No";

}
