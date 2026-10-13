import React from 'react';
import { MapPin, Clock, Phone, Mail, Navigation, MessageCircle } from 'lucide-react';
import { StoreSettings } from '../types/database';

interface LocationSectionProps {
  settings: StoreSettings;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ settings }) => {
  const cleanPhone = (settings.whatsapp_number || '+50764324750').replace(/[^0-9]/g, '');

  const safeMapsUrl =
    settings.google_maps_url && !settings.google_maps_url.includes('3kyhrTZrj')
      ? settings.google_maps_url
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || 'Ballonsdei Panama')}`;

  return (
    <section id="visitanos" className="py-14 sm:py-20 bg-[#F7F1F5] border-t border-[#EADEE6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Information Column */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-semibold tracking-[0.25em] text-[#763D8B] uppercase block mb-1">
                Atelier & Boutique
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#2B1D28] font-normal tracking-tight">
                Visítanos
              </h2>
              <div className="w-12 h-0.5 bg-[#763D8B] mt-3" />
            </div>

            <p className="text-sm text-[#6E5A69] font-light leading-relaxed">
              Te invitamos a conocer de cerca nuestra selección de arreglos florales, globos de autor, muestras de sombrereras y mobiliario para tu evento o celebración.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#763D8B] shrink-0 border border-[#E2D2DC] shadow-2xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2B1D28]">Dirección</h4>
                  <p className="text-xs text-[#6E5A69] font-light mt-0.5">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#763D8B] shrink-0 border border-[#E2D2DC] shadow-2xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2B1D28]">Horario de Atención</h4>
                  <p className="text-xs text-[#6E5A69] font-light mt-0.5">{settings.schedule_hours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#763D8B] shrink-0 border border-[#E2D2DC] shadow-2xs">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2B1D28]">Teléfono Directo</h4>
                  <p className="text-xs text-[#6E5A69] font-light mt-0.5">{settings.phone}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={safeMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tactile inline-flex items-center gap-2 px-6 py-3 bg-[#763D8B] hover:bg-[#602F72] text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-xs transition-[background-color,transform] duration-150 active:scale-[0.97]"
              >
                <Navigation className="w-3.5 h-3.5 text-[#F3E2C4]" />
                <span>Cómo Llegar en Maps</span>
              </a>

              <a
                href={`https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(settings.store_name || 'Ballonsdei')},%20quisiera%20consultar%20sobre%20una%20visita%20o%20pedido.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tactile inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#F3EBF0] text-[#241A23] border border-[#D5C2B8] text-xs font-semibold uppercase tracking-wider rounded-full transition-[background-color,border-color,transform] duration-150 active:scale-[0.97]"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Escríbenos por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Interactive / Visual Map Container */}
          <div className="lg:col-span-7">
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-[#F3EBF0]">
              <div className="absolute inset-0 bg-[#F3EBF0] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[#763D8B] mb-3 border border-[#E2D2DC]">
                  <MapPin className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-xl text-[#2B1D28] font-medium">Boutique {settings.store_name || 'Ballonsdei'}</h4>
                <p className="text-xs text-[#6E5A69] max-w-sm mt-1">
                  {settings.address}
                </p>
                <span className="mt-3 text-[11px] text-[#763D8B] font-medium uppercase tracking-widest bg-white px-3.5 py-1 rounded-full border border-[#E2D2DC]">
                  Ubicación oficial en Google Maps
                </span>

                <a
                  href={safeMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tactile mt-4 px-6 py-2.5 bg-[#241A23] hover:bg-[#3D2539] text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-xs transition-[background-color,transform] duration-150 active:scale-[0.97] flex items-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#F3E2C4]" />
                  <span>Abrir en Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
