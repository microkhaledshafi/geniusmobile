import { CONFIG } from "./config.js";
import { initInvoice } from "./invoice.js";

export async function initBillingApp() {

    console.log(
        `${CONFIG.COMPANY_NAME} Billing Started`
    );

    initInvoice();

}
