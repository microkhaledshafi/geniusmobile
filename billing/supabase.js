/*
==========================================================
Genius Scientific ERP
Supabase Configuration
==========================================================
*/

import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://cxssryhesrgomcdxddwn.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
