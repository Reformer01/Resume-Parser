import { supabase } from './supabase';

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  try {
    // Check if environment variables are set
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!(url && key && url !== 'your-supabase-url' && key !== 'your-supabase-anon-key');
  } catch {
    return false;
  }
}

// Temporary in-memory storage for demo purposes when database is not available
class InMemoryStorage {
  private static data: Map<string, any> = new Map();

  static set(key: string, value: any) {
    this.data.set(key, value);
  }

  static get(key: string) {
    return this.data.get(key);
  }

  static has(key: string) {
    return this.data.has(key);
  }

  static delete(key: string) {
    return this.data.delete(key);
  }

  static clear() {
    this.data.clear();
  }

  static getAll() {
    return Array.from(this.data.entries());
  }
}

export { InMemoryStorage };
