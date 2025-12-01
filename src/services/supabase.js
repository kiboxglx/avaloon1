import { createClient } from '@supabase/supabase-js';

// Substitua pelas suas chaves reais
const supabaseUrl = 'https://zgylxiuydjywidzyjgqx.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
