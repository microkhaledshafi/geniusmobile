/* ==========================================================
   Genius Scientific ERP
   billing.js
========================================================== */

import startup from "./js/startup.js";

/* ==========================================================
   Application Entry
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        try {

            await startup.startup();

        }

        catch (error) {

            console.error(

                "[Billing]",

                error

            );

        }

    }

);
