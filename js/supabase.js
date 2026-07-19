import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://cxssryhesrgomcdxddwn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QiNQzM7U5l6mJpbHIN4UJQ_nv_90lED";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
