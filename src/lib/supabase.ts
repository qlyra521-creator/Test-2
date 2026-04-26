import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dghhsuahtqlwvqnifzor.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_I3ECvjmxXtws7kQGkigO_Q_4OCkIUD1';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
