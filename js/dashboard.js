import { supabase } from "./supabase.js";

async function loadDashboard() {

    try {

        // Products Count
        const { count: productCount } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true });

        document.getElementById("productCount").textContent =
            productCount ?? 0;

        // Customers Count
        const { count: customerCount } = await supabase
            .from("customers")
            .select("*", { count: "exact", head: true });

        document.getElementById("customerCount").textContent =
            customerCount ?? 0;

        // Suppliers Count
        const { count: supplierCount } = await supabase
            .from("suppliers")
            .select("*", { count: "exact", head: true });

        const supplierElement = document.getElementById("supplierCount");
        if (supplierElement) {
            supplierElement.textContent = supplierCount ?? 0;
        }

        // Today's Sales
        const today = new Date().toISOString().split("T")[0];

        const { data: sales } = await supabase
            .from("invoices")
            .select("grand_total")
            .eq("invoice_date", today);

        const todaySales = sales?.reduce(
            (sum, row) => sum + Number(row.grand_total || 0),
            0
        ) || 0;

        document.getElementById("todaySales").textContent =
            "₹ " + todaySales.toLocaleString();

        // Today's Purchase
        const { data: purchases } = await supabase
            .from("purchases")
            .select("grand_total")
            .eq("purchase_date", today);

        const todayPurchase = purchases?.reduce(
            (sum, row) => sum + Number(row.grand_total || 0),
            0
        ) || 0;

        document.getElementById("todayPurchase").textContent =
            "₹ " + todayPurchase.toLocaleString();

    } catch (err) {

        console.error(err);

    }

}

loadDashboard();
