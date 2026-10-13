import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, Send, CheckCircle2, MapPin } from 'lucide-react';
import { StoreSettings } from '../types/database';

interface ContactSectionProps {
  settings: StoreSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setSent(false);
    }, 4000);
  };

  const cleanPhone = (settings.whatsapp_number || '+50764324750').replace(/[^0-9]/g, '');

  return (
    <section id="contacto" className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Direct channels */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-semibold tracking-[0.25em] text-[#763D8B] uppercase block mb-1">
                Atención Personalizada
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#2B1D28] font-normal tracking-tight">
                Contáctanos
              </h2>
              <div className="w-12 h-0.5 bg-[#763D8B] mt-3" />
            </div>

            <p className="text-sm text-[#6E5A69] font-light leading-relaxed">
              ¿Deseas una cotización para un evento especial, un arreglo con requerimientos únicos o consultar la disponibilidad de mobiliario? Estamos listos para asesorarte.
            </p>

            <div className="space-y-4 pt-2">
              <a
                href={`https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(settings.store_name || 'Ballonsdei')},%20deseo%20hacer%20una%20consulta.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7F9] border border-[#EADEE6] hover:border-[#763D8B] transition-[border-color,background-color] duration-150 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-medium tracking-wider text-[#8A7383] block">
                    WhatsApp Inmediato
                  </span>
                  <span className="text-sm font-medium text-[#2B1D28] group-hover:text-[#763D8B]">
                    {settings.whatsapp_number || '+507 6432-4750'}
                  </span>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FAF7F9] border border-[#EADEE6]">
                <div className="w-10 h-10 rounded-full bg-[#763D8B]/10 flex items-center justify-center text-[#763D8B] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-medium tracking-wider text-[#8A7383] block">
                    Llamadas Directas
                  </span>
                  <span className="text-sm font-medium text-[#2E2421]">{settings.phone || '+507 6432-4750'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FAF7F9] border border-[#EADEE6]">
                <div className="w-10 h-10 rounded-full bg-[#763D8B]/10 flex items-center justify-center text-[#763D8B] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-medium tracking-wider text-[#8A7383] block">
                    Correo Electrónico
                  </span>
                  <span className="text-sm font-medium text-[#2E2421]">{settings.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7 bg-[#FAF7F9] p-6 sm:p-8 rounded-2xl border border-[#EADEE6]">
            <h3 className="font-serif text-xl sm:text-2xl text-[#2B1D28] font-normal mb-2">
              Envíanos un Mensaje
            </h3>
            <p className="text-xs text-[#8A7383] font-light mb-6">
              Responderemos tu solicitud a la brevedad posible durante nuestro horario laboral.
            </p>

            {sent ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-serif text-lg font-medium text-[#2B1D28]">
                  ¡Mensaje Enviado con Éxito!
                </h4>
                <p className="text-xs text-[#6E5A69]">
                  Gracias por escribirnos. Nuestro equipo se pondrá en contacto contigo pronto.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#422C3D] font-medium block mb-1">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre completo"
                      className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2B1D28] focus:border-[#763D8B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#422C3D] font-medium block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2B1D28] focus:border-[#763D8B] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#422C3D] font-medium block mb-1">Mensaje o Consulta *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Cuéntanos sobre la fecha de tu evento, tipo de arreglo floral o artículos de alquiler que necesitas..."
                    className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2B1D28] focus:border-[#763D8B] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-cta-emil px-8 py-3.5 bg-[#763D8B] hover:bg-[#602F72] text-white text-xs font-semibold tracking-wider uppercase rounded-full shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
                >
                  <Send className="w-3.5 h-3.5 text-[#F3E2C4]" />
                  <span>Enviar Consulta</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
