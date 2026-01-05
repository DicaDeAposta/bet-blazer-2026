import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Isso vai nos mostrar no F12 se a Vercel está entregando as chaves
console.log('Testando conexão Supabase:');
console.log('URL encontrada:', SUPABASE_URL);
console.log('Chave encontrada:', SUPABASE_PUBLISHABLE_KEY ? "Sim (Protegida)" : "Não encontrada");

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
