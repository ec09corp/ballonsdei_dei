import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Check, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon,
  Database,
  Copy,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Cloud,
  Globe,
  Key,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { StoreSettings } from '../../types/database';
import { settingsService } from '../../services/settingsService';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  testSupabaseConnection, 
  getSupabaseSQLScript,
  isSupabaseConfigured
} from '../../lib/supabase';

interface AdminSettingsProps {
  settings: StoreSettings;
  onRefreshSettings: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onRefreshSettings,
}) => {
  const [storeName, setStoreName] = useState(settings.store_name || 'Ballonsdei');
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || '/logo/logo.jpg');
  const [heroTitle, setHeroTitle] = useState(settings.hero_title || '');
  const [heroSubtitle, setHeroSubtitle] = useState(settings.hero_subtitle || '');
  const [heroImage, setHeroImage] = useState(settings.hero_image || '');
  const [heroBadgeImage, setHeroBadgeImage] = useState(settings.hero_badge_image || '');
  const [heroBadgeTitle, setHeroBadgeTitle] = useState(settings.hero_badge_title || 'Bouquets & Cajas Sombrereras');
  
  // Footer gallery photos
  const [footerPhoto1, setFooterPhoto1] = useState(settings.footer_photo_1 || '');
  const [footerPhoto2, setFooterPhoto2] = useState(settings.footer_photo_2 || '');
  const [footerPhoto3, setFooterPhoto3] = useState(settings.footer_photo_3 || '');
  const [footerPhoto4, setFooterPhoto4] = useState(settings.footer_photo_4 || '');
  const [footerCaption1, setFooterCaption1] = useState(settings.footer_caption_1 || '');
  const [footerCaption2, setFooterCaption2] = useState(settings.footer_caption_2 || '');
  const [footerCaption3, setFooterCaption3] = useState(settings.footer_caption_3 || '');
  const [footerCaption4, setFooterCaption4] = useState(settings.footer_caption_4 || '');

  const [instagramUrl, setInstagramUrl] = useState(settings.instagram_url || '');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [email, setEmail] = useState(settings.email || '');
  const [address, setAddress] = useState(settings.address || '');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(settings.google_maps_url || '');
  const [scheduleHours, setScheduleHours] = useState(settings.schedule_hours || '');
  const [currency, setCurrency] = useState(settings.currency || 'USD');
  const [deliveryFee, setDeliveryFee] = useState<number>(settings.delivery_fee || 5.0);

  // Supabase Configuration State
  const initialCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(initialCreds.anonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedVercelUrlName, setCopiedVercelUrlName] = useState(false);
  const [copiedVercelUrlVal, setCopiedVercelUrlVal] = useState(false);
  const [copiedVercelKeyName, setCopiedVercelKeyName] = useState(false);
  const [copiedVercelKeyVal, setCopiedVercelKeyVal] = useState(false);
  const [copiedConfigSnippet, setCopiedConfigSnippet] = useState(false);
  const [credentialsSource, setCredentialsSource] = useState(initialCreds.source);

  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTestAndSaveSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);

    const cleanUrl = supabaseUrl.trim();
    const cleanKey = supabaseKey.trim();

    const res = await testSupabaseConnection(cleanUrl, cleanKey);
    setSupabaseTestResult(res);
    setIsTestingSupabase(false);

    if (res.success || (cleanUrl.includes('supabase.co') && cleanKey.length > 20)) {
      saveSupabaseCredentials(cleanUrl, cleanKey);
      setCredentialsSource('localStorage');
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 4000);
    }
  };

  const handleCopySql = () => {
    const script = getSupabaseSQLScript();
    navigator.clipboard?.writeText(script);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleCopyText = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard?.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2500);
  };

  const generateConfigSnippet = () => {
    return `/**
 * Configuración central de Supabase para Ballonsdei
 * Ubicación: src/config/supabaseConfig.ts
 */
export const DEFAULT_SUPABASE_CONFIG = {
  url: '${supabaseUrl.trim()}',
  anonKey: '${supabaseKey.trim()}',
};
`;
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setter(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSavedMsg(false);

    try {
      const cleanUrl = supabaseUrl.trim();
      const cleanKey = supabaseKey.trim();

      // If user filled in Supabase details, persist them
      if (cleanUrl && cleanKey) {
        saveSupabaseCredentials(cleanUrl, cleanKey);
      }

      await settingsService.updateSettings({
        store_name: storeName,
        logo_url: logoUrl,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_image: heroImage,
        hero_badge_image: heroBadgeImage,
        hero_badge_title: heroBadgeTitle,
        footer_photo_1: footerPhoto1,
        footer_photo_2: footerPhoto2,
        footer_photo_3: footerPhoto3,
        footer_photo_4: footerPhoto4,
        footer_caption_1: footerCaption1,
        footer_caption_2: footerCaption2,
        footer_caption_3: footerCaption3,
        footer_caption_4: footerCaption4,
        instagram_url: instagramUrl,
        whatsapp_number: whatsappNumber,
        phone,
        email,
        address,
        google_maps_url: googleMapsUrl,
        schedule_hours: scheduleHours,
        currency,
        delivery_fee: Number(deliveryFee) || 0,
      });

      setSavedMsg(true);
      onRefreshSettings();
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error guardando la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2E2421]">
          Configuración General de BALLONSDEI
        </h1>
        <p className="text-xs text-[#7A6B63] mt-1 font-light">
          Administra la información de marca, datos de contacto, enlaces oficiales de Instagram, WhatsApp, Google Maps y tarifa de envíos.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Configuración guardada exitosamente en Supabase.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EDE5DF] shadow-2xs space-y-6 text-xs">
        {/* Identity & Hero Section */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-medium text-[#2E2421] pb-2 border-b border-[#F2ECE6]">
            1. Identidad de Marca y Portada (Hero)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#423530] block mb-1">
                Nombre de la Tienda / Negocio *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#423530] block mb-1">
                Logo de la Tienda (Archivo o URL)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="/logo/logo.svg o URL https://..."
                  className="flex-1 p-2.5 rounded-lg border border-[#D5C2B8]"
                />
                <label className="p-2.5 bg-[#FAF8F5] hover:bg-[#F2ECE6] border border-[#D5C2B8] rounded-lg text-xs font-medium text-[#423530] cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#8D5844]" />
                  <span>Subir Archivo</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setLogoUrl(ev.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-[10px] text-[#8A796F] mt-1">
                Puedes subir un archivo directo o colocar tu imagen en la carpeta <code className="bg-[#FAF8F5] px-1 rounded">/public/logo/logo.png</code>.
              </p>
              {logoUrl && (
                <div className="mt-2 p-2 bg-[#FAF8F5] rounded border border-[#EDE5DF] inline-flex items-center gap-2">
                  <span className="text-[10px] text-[#7A6B63]">Vista previa:</span>
                  <img src={logoUrl} alt="Logo preview" className="h-8 max-w-[120px] object-contain" />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[#423530] block mb-1">
                Título Principal del Hero (Portada)
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Detalles que hacen florecer cada momento"
                className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[#423530] block mb-1">
                Subtítulo del Hero
              </label>
              <textarea
                rows={2}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
              />
            </div>
          </div>
        </div>

        {/* Header & Footer Photos Section */}
        <div className="space-y-5 pt-4 border-t border-[#F2ECE6]">
          <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE6]">
            <div>
              <h3 className="font-serif text-base font-medium text-[#2E2421] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#763D8B]" />
                <span>2. Fotos del Encabezado (Hero) y del Footer</span>
              </h3>
              <p className="text-[11px] text-[#7A6B63] font-light">
                Puedes cambiar todas las fotos del encabezado y del pie de página subiendo archivos o pegando URLs directas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Main Hero Photo Card */}
            <div className="p-4 bg-[#FAF7F9] rounded-xl border border-[#E8DFE5] space-y-3">
              <span className="text-xs font-semibold text-[#2E2421] block">
                Foto Principal del Encabezado (Hero) *
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="https://... o sube una imagen"
                  className="flex-1 p-2 rounded-lg bg-white border border-[#D5C2B8] text-xs"
                />
                <label className="p-2 bg-white hover:bg-[#F2ECE6] border border-[#D5C2B8] rounded-lg text-xs font-medium text-[#423530] cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#763D8B]" />
                  <span>Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setHeroImage)}
                  />
                </label>
              </div>
              {heroImage && (
                <div className="aspect-16/9 rounded-lg overflow-hidden border border-[#D5C2B8] bg-black/5">
                  <img src={heroImage} alt="Hero principal" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Hero Floating Badge Photo Card */}
            <div className="p-4 bg-[#FAF7F9] rounded-xl border border-[#E8DFE5] space-y-3">
              <span className="text-xs font-semibold text-[#2E2421] block">
                Foto del Detalle Flotante ("Diseño Insignia" en Portada)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={heroBadgeImage}
                  onChange={(e) => setHeroBadgeImage(e.target.value)}
                  placeholder="https://... o sube una imagen"
                  className="flex-1 p-2 rounded-lg bg-white border border-[#D5C2B8] text-xs"
                />
                <label className="p-2 bg-white hover:bg-[#F2ECE6] border border-[#D5C2B8] rounded-lg text-xs font-medium text-[#423530] cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#763D8B]" />
                  <span>Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setHeroBadgeImage)}
                  />
                </label>
              </div>
              <div>
                <label className="text-[11px] text-[#7A6B63] block mb-1">Título del detalle</label>
                <input
                  type="text"
                  value={heroBadgeTitle}
                  onChange={(e) => setHeroBadgeTitle(e.target.value)}
                  placeholder="Bouquets & Cajas Sombrereras"
                  className="w-full p-2 rounded-lg bg-white border border-[#D5C2B8] text-xs"
                />
              </div>
              {heroBadgeImage && (
                <div className="aspect-16/9 rounded-lg overflow-hidden border border-[#D5C2B8] bg-black/5">
                  <img src={heroBadgeImage} alt="Detalle insignia" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Footer Gallery 4 Photos */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-[#2E2421] block">
              Fotos de la Vitrina del Footer / Galería de Instagram (4 Fotos)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Foto Footer 1', val: footerPhoto1, setVal: setFooterPhoto1, cap: footerCaption1, setCap: setFooterCaption1 },
                { label: 'Foto Footer 2', val: footerPhoto2, setVal: setFooterPhoto2, cap: footerCaption2, setCap: setFooterCaption2 },
                { label: 'Foto Footer 3', val: footerPhoto3, setVal: setFooterPhoto3, cap: footerCaption3, setCap: setFooterCaption3 },
                { label: 'Foto Footer 4', val: footerPhoto4, setVal: setFooterPhoto4, cap: footerCaption4, setCap: setFooterCaption4 },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-[#FAF7F9] rounded-xl border border-[#E8DFE5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#2E2421]">{item.label}</span>
                    <label className="text-[10px] text-[#763D8B] hover:underline cursor-pointer flex items-center gap-1 font-medium">
                      <Upload className="w-3 h-3" />
                      <span>Subir</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, item.setVal)}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={item.val}
                    onChange={(e) => item.setVal(e.target.value)}
                    placeholder="URL de foto..."
                    className="w-full p-1.5 rounded-lg bg-white border border-[#D5C2B8] text-[11px]"
                  />
                  <input
                    type="text"
                    value={item.cap}
                    onChange={(e) => item.setCap(e.target.value)}
                    placeholder="Texto de la foto..."
                    className="w-full p-1.5 rounded-lg bg-white border border-[#D5C2B8] text-[10px]"
                  />
                  {item.val && (
                    <div className="aspect-square rounded-lg overflow-hidden border border-[#D5C2B8] bg-black/5">
                      <img src={item.val} alt={item.label} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact and Social Networks */}
        <div className="space-y-4 pt-4 border-t border-[#F2ECE6]">
          <h3 className="font-serif text-base font-medium text-[#2E2421] pb-2 border-b border-[#F2ECE6]">
            3. Canales de Contacto y Redes Sociales
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#423530] block mb-1">
                Número de WhatsApp (con código de país)
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+507 6000-0000"
                className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#423530] block mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+507 0000-0000"
                className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#423530] block mb-1">
                Enlace Oficial de Instagram
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/ballonsdei_placeholder"
                className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#423530] block mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@ballonsdei.com"
                className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
              />
            </div>
          </div>
        </div>

        {/* Location & Schedule */}
        <div className="space-y-4 pt-4 border-t border-[#F2ECE6]">
          <h3 className="font-serif text-base font-medium text-[#2E2421] pb-2 border-b border-[#F2ECE6]">
            4. Ubicación y Horario de Atención
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[#423530] block mb-1">
                Dirección Física de la Boutique
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dirección pendiente de confirmación"
                className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[#423530] block mb-1">
                Enlace de Google Maps
              </label>
              <input
                type="text"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[#423530] block mb-1">
                Horario de Atención
              </label>
              <input
                type="text"
                value={scheduleHours}
                onChange={(e) => setScheduleHours(e.target.value)}
                placeholder="Lunes a Sábado: 8:30 AM – 6:30 PM"
                className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
              />
            </div>
          </div>
        </div>

        {/* Currency and Logistics */}
        <div className="space-y-4 pt-4 border-t border-[#F2ECE6]">
          <h3 className="font-serif text-base font-medium text-[#2E2421] pb-2 border-b border-[#F2ECE6]">
            5. Moneda y Costo de Delivery
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#423530] block mb-1">
                Moneda
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="USD"
                className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#423530] block mb-1">
                Costo Base de Delivery ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
              />
            </div>
          </div>
        </div>

        {/* Supabase Real Cloud Database Integration */}
        <div className="space-y-4 pt-6 border-t border-[#EBE2DB] bg-gradient-to-br from-white to-emerald-50/30 p-5 rounded-2xl border border-emerald-200/60 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif text-base font-semibold text-stone-900">
                  6. Base de Datos Supabase (Sincronización en la Nube)
                </h3>
              </div>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Conecta tu proyecto de Supabase para guardar tus productos, fotos y pedidos en la nube de forma permanente.
              </p>
            </div>

            <div className="shrink-0">
              {isSupabaseConfigured ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase Conectado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Modo Local (Sin Supabase)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">
                URL del Proyecto Supabase (Project URL)
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzabcdefg.supabase.co"
                className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-xs font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-stone-500 block mt-1">
                Encuéntrala en Supabase &gt; Project Settings &gt; API &gt; Project URL
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">
                Clave Pública Anónima (Anon Public Key)
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-xs font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-stone-500 block mt-1">
                Encuéntrala en Supabase &gt; Project Settings &gt; API &gt; Project API keys (anon public)
              </span>
            </div>
          </div>

          {/* Test connection alert */}
          {supabaseTestResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2.5 border ${
                supabaseTestResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              {supabaseTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{supabaseTestResult.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-emerald-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border border-stone-300 shadow-2xs"
                title="Copiar script para crear todas las tablas en Supabase"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">¡Script SQL Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-600" />
                    <span>Copiar Script SQL para Supabase</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-stone-500 hidden sm:inline font-light">
                (Pégalo en el SQL Editor de Supabase para crear las tablas con 1 clic)
              </span>
            </div>

            <button
              type="button"
              disabled={isTestingSupabase || !supabaseUrl || !supabaseKey}
              onClick={handleTestAndSaveSupabase}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isTestingSupabase ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verificando conexión...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Probar y Guardar Supabase</span>
                </>
              )}
            </button>
          </div>

          {/* Vercel Permanent Connection Guide & One-Click Tools */}
          <div className="mt-5 pt-5 border-t border-emerald-200/80 bg-white/80 p-4 rounded-xl border border-emerald-200 space-y-4">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-stone-900 text-white rounded-lg shrink-0 mt-0.5">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                  <span>¿Por qué no se conecta en Vercel al montarlo desde GitHub?</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    Solución Definitiva
                  </span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Al subir a GitHub, los archivos locales <code className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-800 font-mono text-[11px]">.env</code> no se suben por seguridad. Por eso, al montar tu web en Vercel, el sistema no tiene las claves y queda en modo desconectado para tus clientes.
                </p>
                <p className="text-xs text-stone-600 font-medium">
                  Para que tu tienda esté <span className="text-emerald-700 font-bold">CONECTADA SIEMPRE en Vercel</span> para cualquier cliente desde cualquier teléfono o computadora, elige cualquiera de estas 2 opciones:
                </p>
              </div>
            </div>

            {/* Option 1: Vercel Environment Variables */}
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[10px]">1</span>
                  OPCIÓN RECOMENDADA: Agregar Variables en Vercel
                </span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Sin tocar código
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Variable 1 */}
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-stone-700">Variable 1 (URL):</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText('VITE_SUPABASE_URL', setCopiedVercelUrlName)}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {copiedVercelUrlName ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedVercelUrlName ? '¡Copiado!' : 'Copiar Nombre'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] bg-stone-50 p-1.5 rounded border border-stone-200 text-stone-900 select-all">
                    VITE_SUPABASE_URL
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-stone-500">Valor de tu proyecto:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(supabaseUrl || 'https://tu-proyecto.supabase.co', setCopiedVercelUrlVal)}
                      className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-1 rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedVercelUrlVal ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedVercelUrlVal ? '¡URL Copiada!' : 'Copiar Valor URL'}</span>
                    </button>
                  </div>
                </div>

                {/* Variable 2 */}
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-stone-700">Variable 2 (Clave Anónima):</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText('VITE_SUPABASE_ANON_KEY', setCopiedVercelKeyName)}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {copiedVercelKeyName ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedVercelKeyName ? '¡Copiado!' : 'Copiar Nombre'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] bg-stone-50 p-1.5 rounded border border-stone-200 text-stone-900 select-all">
                    VITE_SUPABASE_ANON_KEY
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-stone-500">Valor de tu clave:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(supabaseKey || 'tu-anon-public-key', setCopiedVercelKeyVal)}
                      className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-1 rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedVercelKeyVal ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedVercelKeyVal ? '¡Clave Copiada!' : 'Copiar Valor Clave'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Steps in Vercel */}
              <div className="p-3 bg-white/90 rounded-lg border border-emerald-200/70 text-xs text-stone-700 space-y-1">
                <p className="font-semibold text-emerald-950">Pasos rápidos en Vercel:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-stone-600">
                  <li>Entra a tu panel en <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold underline inline-flex items-center gap-0.5">vercel.com <ExternalLink className="w-2.5 h-2.5" /></a> y haz clic en tu proyecto.</li>
                  <li>Ve a la pestaña <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</li>
                  <li>Agrega ambas variables: <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>.</li>
                  <li>Ve a la pestaña <strong>Deployments</strong>, haz clic en los 3 puntos <span className="font-mono font-bold">...</span> de tu último despliegue y selecciona <strong>Redeploy</strong>.</li>
                </ol>
              </div>
            </div>

            {/* Option 2: Direct File Config */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-stone-700 text-white inline-flex items-center justify-center text-[10px]">2</span>
                  OPCIÓN ALTERNATIVA: Archivo de Configuración Directo (100% Automático)
                </span>
                <span className="text-[10px] font-medium text-stone-600 bg-stone-200 px-2 py-0.5 rounded-full">
                  Archivo en GitHub
                </span>
              </div>
              <p className="text-[11px] text-stone-600">
                Hemos creado el archivo <code className="px-1.5 py-0.5 bg-white border border-stone-300 rounded font-mono text-[10px] text-stone-900">src/config/supabaseConfig.ts</code> en el código. Si prefieres no configurar variables en Vercel, copia el bloque abajo y pégalo en ese archivo en tu computadora antes de hacer <code className="text-stone-800 font-bold font-mono">git push</code>:
              </p>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-stone-500 font-mono truncate">
                  src/config/supabaseConfig.ts
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(generateConfigSnippet(), setCopiedConfigSnippet)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  {copiedConfigSnippet ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">¡Código de Configuración Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Contenido para supabaseConfig.ts</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#EBE2DB] flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-7 py-3 bg-[#8D5844] hover:bg-[#744533] text-white rounded-lg font-medium tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Guardando...' : 'Guardar Configuración'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
