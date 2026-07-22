import { supabase } from "../supabase.js";

export async function getCustomers(){

    return await supabase
        .from("customers")
        .select("*");

}
