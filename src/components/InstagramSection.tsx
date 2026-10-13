import React from 'react';
import { Instagram, ArrowUpRight, Heart } from 'lucide-react';
import { StoreSettings } from '../types/database';

interface InstagramSectionProps {
  settings: StoreSettings;
}

export const InstagramSection: React.FC<InstagramSectionProps> = ({ settings }) => {
  const posts = [
    {
      img: settings.footer_photo_1 || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
      caption: settings.footer_caption_1 || 'Bouquets y globos de autor para momentos inolvidables 🌸',
      likes: '248',
    },
    {
      img: settings.footer_photo_2 || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
      caption: settings.footer_caption_2 || 'Cajas sombrereras con detalles de lujo y rosas ✨',
      likes: '315',
    },
    {
      img: settings.footer_photo_3 || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      caption: settings.footer_caption_3 || 'Montaje de Quinceaños y eventos con mobiliario exclusivo 💖',
      likes: '482',
    },
    {
      img: settings.footer_photo_4 || 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=600&q=80',
      caption: settings.footer_caption_4 || 'Detalles y regalos gigantes que sorprenden de verdad 🧸',
      likes: '190',
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-white border-t border-[#EAE1D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4 text-center sm:text-left">
          <div>
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
              Comunidad & Momentos
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#241A23] font-light">
              Síguenos en Instagram
            </h2>
          </div>

          <a
            href={settings.instagram_url || 'https://instagram.com/ballonsdei_placeholder'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tactile inline-flex items-center gap-2 px-6 py-3 bg-[#FAF8F5] hover:bg-[#FAF4F7] text-[#241A23] border border-[#D5C2B8] hover:border-[#763D8B]/40 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors active:scale-[0.97]"
          >
            <Instagram className="w-4 h-4 text-[#763D8B]" />
            <span>@ballonsdei</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A059]" />
          </a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {posts.map((post, idx) => (
            <a
              key={idx}
              href={settings.instagram_url || 'https://instagram.com/ballonsdei_placeholder'}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden bg-[#ECE4DE] block shadow-xs"
            >
              <img
                src={post.img}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
                <div className="flex justify-end">
                  <Instagram className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <p className="text-[11px] line-clamp-2 font-light leading-snug">{post.caption}</p>
                  <div className="flex items-center gap-1 text-[10px] mt-1 text-white/90">
                    <Heart className="w-3 h-3 fill-current text-rose-400" />
                    <span>{post.likes} me gusta</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
