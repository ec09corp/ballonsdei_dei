// Comprobantes de pago: carpeta PRIVADA "comprobantes" en Supabase Storage.
// - El cliente sube la foto con un nombre aleatorio (no se puede adivinar ni listar).
// - Para el mensaje de WhatsApp se pide un enlace temporal (30 días) a la función
//   "enlace-comprobante", que solo lo da si la foto es de un pedido recién hecho.
// - En el panel, la administradora ve la foto con un enlace firmado (12 horas).
import { supabase, isSupabaseConfigured } from './supabase';
import { processImageFile, dataUrlToBlob } from './imageUtils';

const CARPETA = 'comprobantes';

export function nombreComprobanteNuevo(): string {
  const azar = new Uint8Array(12);
  crypto.getRandomValues(azar);
  const hex = Array.from(azar, (b) => b.toString(16).padStart(2, '0')).join('');
  return `comprobante_${Date.now()}_${hex}.jpg`;
}

// Sube la captura (dataURL) comprimida a JPG. Devuelve el nombre del archivo o null si falla.
export async function subirComprobante(dataUrl: string): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured || !dataUrl) return null;
  try {
    let blob = dataUrlToBlob(dataUrl);
    try {
      const archivo = new File([blob], 'comprobante.jpg', { type: blob.type || 'image/jpeg' });
      const comprimido = await processImageFile(archivo, 1600, 0.85);
      if (comprimido) blob = dataUrlToBlob(comprimido);
    } catch {
      // si no se puede comprimir, se sube tal cual
    }
    const nombre = nombreComprobanteNuevo();
    const { error } = await supabase.storage.from(CARPETA).upload(nombre, blob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });
    if (error) {
      console.warn('No se pudo subir el comprobante:', error.message);
      return null;
    }
    return nombre;
  } catch (err) {
    console.warn('No se pudo subir el comprobante:', err);
    return null;
  }
}

// Enlace temporal para WhatsApp (lo firma la función del servidor).
export async function pedirEnlaceComprobante(nombre: string): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured || !nombre) return null;
  try {
    const { data, error } = await supabase.functions.invoke('enlace-comprobante', {
      body: { archivo: nombre },
    });
    if (error || !data?.url) return null;
    return String(data.url);
  } catch {
    return null;
  }
}

// Panel: convierte los nombres guardados en enlaces firmados (solo funciona con sesión de admin).
export async function firmarComprobantes<T extends { receipt_url?: string | null; comprobante_archivo?: string | null }>(
  pedidos: T[]
): Promise<T[]> {
  const nombres = pedidos.map((p) => p.comprobante_archivo).filter((n): n is string => !!n);
  if (!supabase || !isSupabaseConfigured || nombres.length === 0) return pedidos;
  try {
    const { data, error } = await supabase.storage.from(CARPETA).createSignedUrls(nombres, 12 * 3600);
    if (error || !Array.isArray(data)) return pedidos;
    const mapa = new Map<string, string>();
    data.forEach((d: any) => {
      if (d?.path && d?.signedUrl) mapa.set(d.path, d.signedUrl);
    });
    return pedidos.map((p) =>
      p.comprobante_archivo && mapa.get(p.comprobante_archivo)
        ? { ...p, receipt_url: mapa.get(p.comprobante_archivo)! }
        : p
    );
  } catch {
    return pedidos;
  }
}
