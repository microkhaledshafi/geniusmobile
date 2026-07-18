import { supabase } from "./supabase.js";

document.getElementById("sidebar").innerHTML =
await (await fetch("../components/sidebar.html")).text();

document.getElementById("navbar").innerHTML =
await (await fetch("../components/navbar.html")).text();

const { data } = await supabase.auth.getUser();

if (!data.user) {

    window.location.href = "../login.html";

}

document.getElementById("userEmail").innerHTML =
data.user.email;

document.getElementById("logoutBtn").onclick = async () => {

    await supabase.auth.signOut();

    window.location.href = "../login.html";

};
