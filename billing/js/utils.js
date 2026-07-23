export function qs(selector) {

    return document.querySelector(selector);

}

export function qsa(selector) {

    return document.querySelectorAll(selector);

}

export function today() {

    return new Date().toISOString().substring(0,10);

}

export function money(value) {

    return Number(value || 0).toFixed(2);

}
export function debounce(fn, delay = 300) {
    let timer;

    return (...args) => {
        clearTimeout(timer);

        timer = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}

export function isEmpty(value) {
    return value == null || String(value).trim() === "";
}

export function sanitizeString(value) {
    return String(value ?? "").trim();
}
