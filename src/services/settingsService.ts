import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { StoreSettings } from '../types/database';
import { INITIAL_SETTINGS } from '../lib/mockData';

const LOCAL_SETTINGS_KEY = 'balloonsdei_settings_cache_v3';

function getLocalSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-upgrade name to BALLOONSDEI
      if (!parsed.store_name || parsed.store_name.toLowerCase().includes('ballon')) {
        parsed.store_name = 'BALLOONSDEI';
      }
      if (parsed.logo_url === '/logo/logo.svg') {
        parsed.logo_url = '/logo/logo.jpg';
      }
      if (!parsed.phone || parsed.phone.includes('0000-0000')) {
        parsed.phone = '+507 6432-4750';
      }
      if (!parsed.whatsapp_number || parsed.whatsapp_number.includes('0000-0000')) {
        parsed.whatsapp_number = '+507 6432-4750';
      }
      if (
        !parsed.google_maps_url ||
        parsed.google_maps_url.includes('boutique+ballonsdei') ||
        parsed.google_maps_url.includes('maps.google.com/?q=ballonsdei') ||
        parsed.google_maps_url.includes('3kyhrTZrjEUyy8e9') ||
        parsed.google_maps_url.includes('3kyhrTZrj')
      ) {
        parsed.google_maps_url = 'https://www.google.com/maps/search/?api=1&query=BALLOONSDEI+Colon+Panama';
      }
      return {
        ...INITIAL_SETTINGS,
        ...parsed,
      };
    }
  } catch (e) {}
  return INITIAL_SETTINGS;
}

function saveLocalSettings(settings: StoreSettings) {
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
}

export const settingsService = {
  async getSettings(): Promise<StoreSettings> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .single();

        if (!error && data) {
          return {
            ...INITIAL_SETTINGS,
            ...data,
          };
        }
      } catch (err) {
        console.warn('Error fetching settings from Supabase, using local:', err);
      }
    }

    return getLocalSettings();
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = getLocalSettings();
    const updated = { ...current, ...settings };
    saveLocalSettings(updated);

    if (supabase && isSupabaseConfigured) {
      try {
        const payload = {
          id: 'current_settings',
          ...INITIAL_SETTINGS,
          ...current,
          ...settings,
        };

        const { data, error } = await supabase
          .from('settings')
          .upsert(payload)
          .select()
          .maybeSingle();

        if (error) {
          console.warn('Notice updating settings in Supabase:', error.message);
        } else if (data) {
          return { ...updated, ...data };
        }
      } catch (err: any) {
        console.error('Error updating settings in Supabase:', err.message || err);
      }
    }

    return updated;
  },
};
