import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Soportar ambos nombres: anon key clásica y publishable key nueva
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

/**
 * Verifica si las credenciales de Supabase están configuradas (no son placeholder).
 */
export function isSupabaseConfigured() {
    return (
        supabaseUrl &&
        supabaseAnonKey &&
        supabaseUrl !== 'your_supabase_url_here' &&
        supabaseAnonKey !== 'your_supabase_anon_key_here' &&
        supabaseUrl.startsWith('https://')
    );
}

/**
 * Crea un cliente de Supabase para uso en el browser.
 * Retorna null si las credenciales no están configuradas.
 */
export function getSupabase() {
    if (!isSupabaseConfigured()) {
        return null;
    }
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Singleton del cliente Supabase para el browser.
 */
let _supabase = null;
export function getSupabaseClient() {
    if (!_supabase && isSupabaseConfigured()) {
        _supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
    }
    return _supabase;
}

/**
 * Verifica la conexión a Supabase haciendo un query de prueba.
 * @returns {Promise<{connected: boolean, error?: string}>}
 */
export async function checkSupabaseConnection() {
    if (!isSupabaseConfigured()) {
        return { connected: false, error: 'Credenciales de Supabase no configuradas' };
    }

    try {
        const supabase = getSupabaseClient();
        // Intentar un query sencillo para verificar la conexión
        const { error } = await supabase.from('courses').select('id').limit(1);

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows returned, lo cual es normal
            return { connected: false, error: error.message };
        }

        return { connected: true };
    } catch (err) {
        return { connected: false, error: err.message };
    }
}
