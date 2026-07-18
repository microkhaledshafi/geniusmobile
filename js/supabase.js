import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = "https://cxssryhesrgomcdxddwn.supabase.co"

const supabaseKey = "sb_publishable_QiNQzM7U5l6mJpbHIN4UJQ_nv_90lED"

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
)
