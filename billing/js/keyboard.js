/* ==========================================================
   Genius Scientific ERP
   keyboard.js
   Part 1
========================================================== */

import { saveInvoice } from "./saveInvoice.js";

import { openHistory } from "./history.js";

import { refreshDashboard } from "./dashboard.js";

let initialized = false;

/* ==========================================================
   Initialize
========================================================== */

export function initializeKeyboard() {

    if (initialized)
        return;

    document.addEventListener(

        "keydown",

        handleKeyDown

    );

    initialized = true;

    console.log(

        "[Keyboard] Initialized"

    );

}

/* ==========================================================
   Handle Keyboard
========================================================== */

function handleKeyDown(event) {

    if (event.defaultPrevented)
        return;

    if (event.ctrlKey && event.key === "s") {

        event.preventDefault();

        saveInvoice();

        return;

    }

    if (event.key === "F2") {

        event.preventDefault();

        openHistory();

        return;

    }

    if (event.key === "F5") {

        event.preventDefault();

        refreshDashboard();

        return;

    }

    if (event.key === "Escape") {

        event.preventDefault();

        handleEscape();

        return;

    }

}

/* ==========================================================
   Handle Escape
========================================================== */

function handleEscape() {

    const modal = document.querySelector(".modal.show");

    if (modal) {

        const instance = bootstrap.Modal.getInstance(modal);

        if (instance) {

            instance.hide();

            return;

        }

    }

    const activeElement = document.activeElement;

    if (activeElement) {

        activeElement.blur();

    }

}

/* ==========================================================
   Enable Keyboard
========================================================== */

export function enableKeyboard() {

    if (initialized)
        return;

    document.addEventListener(

        "keydown",

        handleKeyDown

    );

    initialized = true;

}

/* ==========================================================
   Disable Keyboard
========================================================== */

export function disableKeyboard() {

    if (!initialized)
        return;

    document.removeEventListener(

        "keydown",

        handleKeyDown

    );

    initialized = false;

}

/* ==========================================================
   Destroy Keyboard
========================================================== */

export function destroyKeyboard() {

    disableKeyboard();

}

/* ==========================================================
   Default Export
========================================================== */

export default {

    initializeKeyboard,

    enableKeyboard,

    disableKeyboard,

    destroyKeyboard

};
