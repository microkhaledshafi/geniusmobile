import { supabase } from "./supabase.js";

const table = document.getElementById("productTable");
const searchInput = document.getElementById("searchProduct");

// Load Products
async function loadProducts(search = "") {

    // Loading message
    table.innerHTML = `
        <tr>
            <td colspan="8" style="text-align:center;padding:20px;">
                Loading products...
            </td>
        </tr>
    `;

    try {

        let query = supabase
            .from("products")
            .select(`
                id,
                product_code,
                product_name,
                barcode,
                mrp,
                selling_rate,
                quantity,
                gst,
                categories(category_name)
            `)
            .order("product_name", { ascending: true });

        // Search
        if (search !== "") {

            query = query.or(
                `product_name.ilike.%${search}%,product_code.ilike.%${search}%,barcode.ilike.%${search}%`
            );

        }

        const { data, error } = await query;

        if (error) throw error;

        // No Records
        if (!data || data.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:20px;">
                        No products found
                    </td>
                </tr>
            `;

            return;

        }

        table.innerHTML = "";

        data.forEach(product => {

            table.innerHTML += `
                <tr>

                    <td>${product.product_code ?? ""}</td>

                    <td>${product.product_name ?? ""}</td>

                    <td>${product.categories?.category_name ?? "-"}</td>

                    <td>₹ ${Number(product.mrp ?? 0).toFixed(2)}</td>

                    <td>₹ ${Number(product.selling_rate ?? 0).toFixed(2)}</td>

                    <td>${product.quantity ?? 0}</td>

                    <td>${product.gst ?? 0}%</td>

                    <td>

                        <button class="btn-edit" onclick="editProduct(${product.id})">
                            Edit
                        </button>

                    </td>

                </tr>
            `;

        });

    } catch (err) {

        console.error(err);

        table.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;color:red;padding:20px;">
                    Error loading products
                </td>
            </tr>
        `;

    }

}

// Live Search
searchInput.addEventListener("input", () => {

    loadProducts(searchInput.value.trim());

});

// Placeholder Edit Function
window.editProduct = function(id) {

    alert("Edit Product ID : " + id);

};

// Initial Load
loadProducts();
