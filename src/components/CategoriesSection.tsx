import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Category } from '../types/database';

interface CategoriesSectionProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-14 sm:py-20 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-2">
            Nuestras Colecciones
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#241A23] font-light tracking-tight">
            Explora por Categoría
          </h2>
          <div className="w-12 h-0.5 bg-[#763D8B] mx-auto mt-4" />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer border transition-[border-color,box-shadow,transform] duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] ${
                  isSelected
                    ? 'border-[#763D8B] shadow-md ring-2 ring-[#763D8B]/20'
                    : 'border-[#EAE1D9] hover:border-[#C5A059]/60 shadow-xs hover:shadow-lg'
                }`}
              >
                {/* Image (Vertical portrait format) */}
                <div className="aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-[#ECE4DE]">
                  <img
                    src={cat.image_url || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                </div>

                {/* Card Content Overlay */}
                <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-medium tracking-wide">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-[11px] text-white/80 line-clamp-1 font-light mt-0.5 hidden sm:block">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 group-hover:bg-[#763D8B] transition-colors ml-2">
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
