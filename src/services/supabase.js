import { createClient } from '@supabase/supabase-js';

const getEnv = (key) => {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
        return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return undefined;
};

const supabaseUrl = 'https://zgylxiuydjywidzyjgqx.supabase.co';
const supabaseKey = getEnv('VITE_SUPABASE_KEY');

export const supabase = createClient(supabaseUrl, supabaseKey);
