/*********************************************************************
 * Genius Scientific ERP
 * Module : Products
 * File   : products.js
 * Part   : 1 of 4
 *********************************************************************/

import { supabase } from "./supabase.js";

/*********************************************************************
 * DOM REFERENCES
 *********************************************************************/

const productTable = document.getElementById("productTable");

const productForm = document.getElementById("productForm");

const productModal = document.getElementById("productModal");

const modalTitle = document.getElementById("modalTitle");

const addProductBtn = document.getElementById("addProductBtn");

const closeModalBtn = document.getElementById("closeModal");

const searchProduct = document.getElementById("searchProduct");

const saveProductBtn = document.getElementById("saveProductBtn");


/*********************************************************************
 * GLOBAL VARIABLES
 *********************************************************************/

let productList = [];

let editingProductId = null;


/*********************************************************************
 * INITIALIZATION
 *********************************************************************/

document.addEventListener("DOMContentLoaded", () => {

    initializeProducts();

});


async function initializeProducts() {

    registerEvents();

    await loadProducts();

}


/*********************************************************************
 * EVENT REGISTRATION
 *********************************************************************/

function registerEvents() {

    addProductBtn.addEventListener("click", openAddProductModal);

    closeModalBtn.addEventListener("click", closeProductModal);

    window.addEventListener("click", outsideModalClose);

    searchProduct.addEventListener("input", searchProducts);

}


/*********************************************************************
 * LOAD PRODUCTS
 *********************************************************************/

async function loadProducts(search = "") {

    showLoading();

    try {

        let query = supabase
            .from("products")
            .select("*")
            .order("product", { ascending: true });

        if (search !== "") {

            query = query.or(
                `product.ilike.%${search}%,
manufacturer.ilike.%${search}%,
category.ilike.%${search}%,
hsn.ilike.%${search}%,
batch.ilike.%${search}%,
lot.ilike.%${search}%`
            );

        }

        const { data, error } = await query;

        if (error) throw error;

        productList = data || [];

        renderProducts();

    }

    catch (error) {

        console.error(error);

        showError(error.message);

    }

}


/*********************************************************************
 * RENDER PRODUCTS
 *********************************************************************/

function renderProducts() {

    if (productList.length === 0) {

        productTable.innerHTML = `
        <tr>
            <td colspan="13" style="text-align:center;">
                No Products Found
            </td>
        </tr>
        `;

        return;

    }

    let html = "";

    productList.forEach(product => {

        html += `

        <tr>

            <td>${product.product ?? ""}</td>

            <td>${product.manufacturer ?? ""}</td>

            <td>${product.category ?? ""}</td>

            <td>${Number(product.mrp ?? 0).toFixed(2)}</td>

            <td>${Number(product.selling_rate ?? 0).toFixed(2)}</td>

            <td>${Number(product.purchase_rate ?? 0).toFixed(2)}</td>

            <td>${product.gst ?? 0}%</td>

            <td>${product.quantity ?? 0}</td>

            <td>${product.unit ?? ""}</td>

            <td>${product.batch ?? ""}</td>

            <td>${product.lot ?? ""}</td>

            <td>${product.expiry ?? ""}</td>

            <td>

                <button
                    class="btn-edit"
                    onclick="editProduct(${product.id})">

                    Edit

                </button>

                <button
                    class="btn-delete"
                    onclick="deleteProduct(${product.id})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

    productTable.innerHTML = html;

}


/*********************************************************************
 * SEARCH
 *********************************************************************/

function searchProducts() {

    loadProducts(searchProduct.value.trim());

}


/*********************************************************************
 * MODAL
 *********************************************************************/

function openAddProductModal() {

    editingProductId = null;

    modalTitle.innerText = "Add Product";

    productForm.reset();

    productModal.style.display = "flex";

}


function closeProductModal() {

    productModal.style.display = "none";

}


function outsideModalClose(event) {

    if (event.target === productModal) {

        closeProductModal();

    }

}


/*********************************************************************
 * MESSAGE HELPERS
 *********************************************************************/

function showLoading() {

    productTable.innerHTML = `
    <tr>
        <td colspan="13" style="text-align:center;">
            Loading Products...
        </td>
    </tr>
    `;

}


function showError(message) {

    productTable.innerHTML = `
    <tr>
        <td colspan="13"
            style="text-align:center;color:red;">

            ${message}

        </td>
    </tr>
    `;

}


/*********************************************************************
 * PLACE HOLDERS
 * (Implemented in Part 2 onwards)
 *********************************************************************/

window.editProduct = function(id){

    console.log("Edit :", id);

}


window.deleteProduct = function(id){

    console.log("Delete :", id);

}


/*********************************************************************
 * END OF PART 1
 *********************************************************************/

/*********************************************************************
 * Genius Scientific ERP
 * Module : Products
 * File   : products.js
 * Part   : 2 of 4
 *
 * ADD PRODUCT
 *********************************************************************/


/*********************************************************************
 * FORM SUBMIT
 *********************************************************************/

productForm.addEventListener("submit", saveProduct);



/*********************************************************************
 * SAVE PRODUCT
 *********************************************************************/

async function saveProduct(event) {

    event.preventDefault();

    saveProductBtn.disabled = true;
    saveProductBtn.innerText = "Saving...";

    const product = getFormData();

    const validation = validateProduct(product);

    if (!validation.valid) {

        alert(validation.message);

        saveProductBtn.disabled = false;
        saveProductBtn.innerText = "Save Product";

        return;

    }

    try {

        const { error } = await supabase
            .from("products")
            .insert([product]);

        if (error) throw error;

        alert("Product Added Successfully.");

        closeProductModal();

        productForm.reset();

        await loadProducts();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

    finally {

        saveProductBtn.disabled = false;

        saveProductBtn.innerText = "Save Product";

    }

}



/*********************************************************************
 * READ FORM
 *********************************************************************/

function getFormData() {

    return {

        product:
            document.getElementById("productName").value.trim(),

        manufacturer:
            document.getElementById("manufacturer").value.trim(),

        category:
            document.getElementById("category").value.trim(),

        hsn:
            document.getElementById("hsn").value.trim(),

        purchase_rate:
            Number(
                document.getElementById("purchaseRate").value || 0
            ),

        selling_rate:
            Number(
                document.getElementById("sellingRate").value || 0
            ),

        mrp:
            Number(
                document.getElementById("mrp").value || 0
            ),

        gst:
            Number(
                document.getElementById("gst").value || 0
            ),

        quantity:
            Number(
                document.getElementById("quantity").value || 0
            ),

        unit:
            document.getElementById("unit").value.trim(),

        batch:
            document.getElementById("batch").value.trim(),

        lot:
            document.getElementById("lot").value.trim(),

        expiry:
            document.getElementById("expiry").value || null

    };

}



/*********************************************************************
 * VALIDATION
 *********************************************************************/

function validateProduct(product) {

    if (product.product === "") {

        return {

            valid: false,

            message: "Please enter Product Name."

        };

    }

    if (product.purchase_rate < 0) {

        return {

            valid: false,

            message: "Purchase Rate cannot be negative."

        };

    }

    if (product.selling_rate < 0) {

        return {

            valid: false,

            message: "Selling Rate cannot be negative."

        };

    }

    if (product.mrp < 0) {

        return {

            valid: false,

            message: "MRP cannot be negative."

        };

    }

    if (product.quantity < 0) {

        return {

            valid: false,

            message: "Quantity cannot be negative."

        };

    }

    if (product.gst < 0 || product.gst > 100) {

        return {

            valid: false,

            message: "GST must be between 0 and 100."

        };

    }

    return {

        valid: true,

        message: ""

    };

}



/*********************************************************************
 * CLEAR FORM
 *********************************************************************/

function clearProductForm() {

    productForm.reset();

}



/*********************************************************************
 * END OF PART 2
 *********************************************************************/

/*********************************************************************
 * Genius Scientific ERP
 * Module : Products
 * File   : products.js
 * Part   : 3 of 4
 *
 * EDIT PRODUCT
 *********************************************************************/


/*********************************************************************
 * EDIT PRODUCT
 *********************************************************************/

window.editProduct = async function(id){

    editingProductId = id;

    try{

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", id)
            .single();

        if(error) throw error;

        fillProductForm(data);

        modalTitle.innerText = "Edit Product";

        productModal.style.display = "flex";

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}



/*********************************************************************
 * FILL FORM
 *********************************************************************/

function fillProductForm(product){

    document.getElementById("productName").value =
        product.product || "";

    document.getElementById("manufacturer").value =
        product.manufacturer || "";

    document.getElementById("category").value =
        product.category || "";

    document.getElementById("hsn").value =
        product.hsn || "";

    document.getElementById("purchaseRate").value =
        product.purchase_rate || 0;

    document.getElementById("sellingRate").value =
        product.selling_rate || 0;

    document.getElementById("mrp").value =
        product.mrp || 0;

    document.getElementById("gst").value =
        product.gst || 0;

    document.getElementById("quantity").value =
        product.quantity || 0;

    document.getElementById("unit").value =
        product.unit || "";

    document.getElementById("batch").value =
        product.batch || "";

    document.getElementById("lot").value =
        product.lot || "";

    document.getElementById("expiry").value =
        product.expiry || "";

}



/*********************************************************************
 * UPDATE PRODUCT
 *********************************************************************/

async function updateProduct(product){

    const { error } = await supabase

        .from("products")

        .update(product)

        .eq("id", editingProductId);

    if(error) throw error;

}



/*********************************************************************
 * OVERRIDE SAVE FUNCTION
 *********************************************************************/

async function saveProduct(event){

    event.preventDefault();

    saveProductBtn.disabled = true;

    saveProductBtn.innerText = "Saving...";

    const product = getFormData();

    const validation = validateProduct(product);

    if(!validation.valid){

        alert(validation.message);

        saveProductBtn.disabled = false;

        saveProductBtn.innerText = "Save Product";

        return;

    }

    try{

        if(editingProductId === null){

            const { error } = await supabase

                .from("products")

                .insert([product]);

            if(error) throw error;

            alert("Product Added Successfully.");

        }

        else{

            await updateProduct(product);

            alert("Product Updated Successfully.");

        }

        editingProductId = null;

        productForm.reset();

        closeProductModal();

        await loadProducts();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

    finally{

        saveProductBtn.disabled = false;

        saveProductBtn.innerText = "Save Product";

    }

}


/*********************************************************************
 * END OF PART 3
 *********************************************************************/

/*********************************************************************
 * Genius Scientific ERP
 * Module : Products
 * File   : products.js
 * Part   : 4 of 4
 *
 * DELETE PRODUCT
 *********************************************************************/


/*********************************************************************
 * DELETE PRODUCT
 *********************************************************************/

window.deleteProduct = async function(id){

    const confirmDelete = confirm(
        "Are you sure you want to delete this product?"
    );

    if(!confirmDelete)
        return;

    try{

        const { error } = await supabase

            .from("products")

            .delete()

            .eq("id", id);

        if(error) throw error;

        alert("Product Deleted Successfully.");

        await loadProducts();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};



/*********************************************************************
 * REFRESH PRODUCTS
 *********************************************************************/

async function refreshProducts(){

    await loadProducts(
        searchProduct.value.trim()
    );

}



/*********************************************************************
 * RESET EDIT MODE
 *********************************************************************/

function resetEditMode(){

    editingProductId = null;

    modalTitle.innerText = "Add Product";

}



/*********************************************************************
 * RESET FORM
 *********************************************************************/

function resetForm(){

    resetEditMode();

    productForm.reset();

}



/*********************************************************************
 * MODAL CLEANUP
 *********************************************************************/

function closeAndResetModal(){

    resetForm();

    closeProductModal();

}



/*********************************************************************
 * ESC KEY CLOSE MODAL
 *********************************************************************/

document.addEventListener("keydown",(event)=>{

    if(event.key==="Escape"){

        closeAndResetModal();

    }

});



/*********************************************************************
 * DOUBLE CLICK PROTECTION
 *********************************************************************/

let savingInProgress=false;

function beginSaving(){

    if(savingInProgress)
        return false;

    savingInProgress=true;

    saveProductBtn.disabled=true;

    return true;

}

function endSaving(){

    savingInProgress=false;

    saveProductBtn.disabled=false;

}



/*********************************************************************
 * DATE FORMATTER
 *********************************************************************/

function formatDate(date){

    if(!date)
        return "";

    return new Date(date)
        .toLocaleDateString();

}



/*********************************************************************
 * NUMBER FORMATTER
 *********************************************************************/

function money(value){

    return Number(value || 0)
        .toFixed(2);

}



/*********************************************************************
 * STOCK STATUS
 *********************************************************************/

function stockStatus(qty){

    qty=Number(qty);

    if(qty<=0)
        return "Out of Stock";

    if(qty<10)
        return "Low Stock";

    return "Available";

}



/*********************************************************************
 * FUTURE MODULE PLACE HOLDERS
 *********************************************************************/

// Duplicate Product
function duplicateProduct(id){

    console.log("Duplicate",id);

}

// Print Barcode
function printBarcode(id){

    console.log("Barcode",id);

}

// Export Excel
function exportProducts(){

    console.log("Export");

}

// Import Excel
function importProducts(){

    console.log("Import");

}



/*********************************************************************
 * PRODUCTS MODULE COMPLETE
 *********************************************************************/

console.log("====================================");
console.log("Products Module Loaded Successfully");
console.log("CRUD : READY");
console.log("Search : READY");
console.log("Modal : READY");
console.log("Supabase : CONNECTED");
console.log("====================================");
