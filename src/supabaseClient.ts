import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wyemvybxbvqukmytslsh.supabase.co'; // your URL
const SUPABASE_ANON_KEY = 'sb_publishable_g-rf401y-dfLOO3kRjmeMA_3xID8a9F';      // your anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);