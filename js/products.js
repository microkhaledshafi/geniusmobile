import { supabase } from "./supabase.js";

const searchInput = document.getElementById("searchProduct");

const table = document.getElementById("productTable");

async function loadProducts(search = "") {

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
        .order("product_name");

    if (search !== "") {

        query = query.or(
            `product_name.ilike.%${search}%,
             product_code.ilike.%${search}%,
             barcode.ilike.%${search}%`
        );

    }

    const { data, error } = await query;

    if (error) {

        console.error(error);

        return;

    }

    table.innerHTML = "";

    data.forEach(product => {

        table.innerHTML += `

        <tr>

            <td>${product.product_code ?? ""}</td>

            <td>${product.product_name}</td>

            <td>${product.categories?.category_name ?? ""}</td>

            <td>₹ ${product.mrp}</td>

            <td>₹ ${product.selling_rate}</td>

            <td>${product.quantity}</td>

            <td>${product.gst}%</td>

            <td>

                <button onclick="editProduct(${product.id})">
                    Edit
                </button>

            </td>

        </tr>

        `;

    });

}
searchInput.addEventListener("keyup", () => {

    loadProducts(searchInput.value.trim());

});
loadProducts();
