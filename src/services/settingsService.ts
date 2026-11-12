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

const SETTINGS_ROW_ID = '75b13ef3-b885-462e-a110-f2fccbc47530';

export const settingsService = {
  async getSettings(): Promise<StoreSettings> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('metadata')
          .eq('id', SETTINGS_ROW_ID)
          .maybeSingle();

        const guardada = data?.metadata?.store_settings;
        if (!error && guardada && typeof guardada === 'object') {
          const merged = { ...INITIAL_SETTINGS, ...guardada } as StoreSettings;
          // Datos que pidió la dueña (11 nov): si la dirección está vacía o el horario es el
          // viejo, se usan los nuevos hasta que se guarden desde Configuración.
          if (!String(merged.address || '').trim()) merged.address = INITIAL_SETTINGS.address;
          if (String(merged.schedule_hours || '').startsWith('Lunes a Sábado: 8:30 AM – 6:30 PM')) {
            merged.schedule_hours = INITIAL_SETTINGS.schedule_hours;
          }
          saveLocalSettings(merged);
          return merged;
        }
      } catch (err) {
        console.warn('Error fetching settings from Supabase, using local:', err);
      }
    }

    return getLocalSettings();
  },

  // Guarda la configuración en settings.metadata.store_settings (la tabla no tiene
  // columnas para todos los campos del panel). Si Supabase falla, lanza el error
  // para que el panel lo muestre en vez de decir "guardado".
  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings } as StoreSettings;

    if (!supabase || !isSupabaseConfigured) {
      throw new Error('No hay conexión con la base de datos. No se guardó.');
    }

    const { data: row, error: readErr } = await supabase
      .from('settings')
      .select('metadata')
      .eq('id', SETTINGS_ROW_ID)
      .maybeSingle();
    if (readErr || !row) {
      throw new Error('No se pudo leer la configuración: ' + (readErr?.message || 'fila no encontrada'));
    }

    const metadata = { ...(row.metadata || {}), store_settings: updated };
    const { data: saved, error } = await supabase
      .from('settings')
      .update({
        metadata,
        business_name: updated.store_name || 'BALLOONSDEI',
        logo_url: updated.logo_url || null,
        instagram_url: updated.instagram_url || null,
        whatsapp_number: updated.whatsapp_number || null,
        phone_number: updated.phone || null,
        email: updated.email || null,
        address: updated.address || null,
        google_maps_url: updated.google_maps_url || null,
        opening_hours: (updated as any).schedule_hours || null,
        delivery_fee: Number(updated.delivery_fee) || 0,
      })
      .eq('id', SETTINGS_ROW_ID)
      .select('id');

    if (error || !saved || saved.length === 0) {
      throw new Error('No se pudo guardar en la base de datos: ' + (error?.message || 'sin permiso'));
    }

    saveLocalSettings(updated);
    return updated;
  },
};
