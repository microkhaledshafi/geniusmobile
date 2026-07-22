import { supabase } from "../supabase.js";

export const api = {

    async getCustomers() {

        return await supabase
            .from("customers")
            .select("*");

    },

    async getProducts() {

        return await supabase
            .from("products")
            .select("*");

    }

};
