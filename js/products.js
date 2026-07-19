console.log("products.js loaded");
import { supabase } from "./supabase.js";

const table = document.getElementById("productTable");
const modal = document.getElementById("productModal");
const addBtn = document.getElementById("addProductBtn");
const closeBtn = document.getElementById("closeModal");
const form = document.getElementById("productForm");
const searchInput = document.getElementById("searchProduct");

// ============================
// Load Products
// ============================
async function loadProducts(search = "") {

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
            .select("*")
            .order("product", { ascending: true });

        if (search) {
            query = query.or(
                `product.ilike.%${search}%,manufacturer.ilike.%${search}%,category.ilike.%${search}%`
            );
        }

        const { data, error } = await query;

console.log("DATA:", data);
console.log("ERROR:", error);

        if (error) throw error;

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

                    <td>${product.product ?? ""}</td>

                    <td>${product.manufacturer ?? ""}</td>

                    <td>${product.category ?? ""}</td>

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

        console.error("Products Error:", err);

        table.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;color:red;padding:20px;">
                    Error loading products
                </td>
            </tr>
        `;

    }

}

// ============================
// Open Modal
// ============================
addBtn.onclick = () => {

    form.reset();

    document.getElementById("productId").value = "";

    document.getElementById("modalTitle").textContent = "Add Product";

    modal.style.display = "flex";

};

// ============================
// Close Modal
// ============================
closeBtn.onclick = () => {

    modal.style.display = "none";

};

window.onclick = function(e) {

    if (e.target === modal) {
        modal.style.display = "none";
    }

};

// ============================
// Search
// ============================
searchInput.addEventListener("input", () => {

    loadProducts(searchInput.value.trim());

});

// ============================
// Edit (Placeholder)
// ============================
window.editProduct = function(id) {

    alert("Edit Product ID : " + id);

};

// ============================
// Initial Load
// ============================
loadProducts();
