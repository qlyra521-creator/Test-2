import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mjdgzqevfgvlnzpdggqp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_j6Pm8GZZAKn_9qNXSp2jPQ_AhrhuRqq';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const MEDIA_BUCKET = 'memory-photos';
