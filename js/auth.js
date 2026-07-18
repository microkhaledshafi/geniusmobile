import { supabase } from "./supabase.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const btn=document.getElementById("loginBtn");

    btn.disabled=true;

    btn.innerHTML="Signing In...";

    const {error}=await supabase.auth.signInWithPassword({

        email,

        password

    });

    btn.disabled=false;

    btn.innerHTML="Login";

    if(error){

        document.getElementById("message").innerHTML=error.message;

        return;

    }

    window.location.href="pages/dashboard.html";

});
