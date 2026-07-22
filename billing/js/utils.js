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
