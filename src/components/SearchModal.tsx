import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { Product } from '../types/database';

interface SearchModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  products,
  onClose,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        (p.tags && String(p.tags).toLowerCase().includes(term))
    );
  }, [searchTerm, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#FAF8F5] rounded-2xl shadow-2xl overflow-hidden border border-[#E8DED7] flex flex-col animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="p-4 border-b border-[#EBE2DB] bg-white flex items-center gap-3">
          <Search className="w-5 h-5 text-[#763D8B] shrink-0" />
          <input
            id="search-store-input"
            aria-label="Buscar productos, arreglos o servicios"
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por flores, rosas, peluches, sombrerera, cilindros..."
            className="w-full text-sm bg-transparent border-none text-[#241A23] placeholder:text-[#6E5A69] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-[#6E5A69] hover:text-[#241A23] px-2 py-1"
            >
              Borrar
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-[#6E5A69] hover:text-[#241A23] hover:bg-[#F2ECE6] rounded-full transition-colors ml-1"
            aria-label="Cerrar modal de búsqueda"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {!searchTerm.trim() ? (
            <div className="py-8 text-center text-xs text-[#6E5A69] space-y-2 font-light">
              <p>Escribe para buscar cualquier producto o servicio de BALLONSDEI.</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {['Rosas', 'Sombrerera', 'Peluches', 'Quinceaños', 'Alquiler', 'Cilindros'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchTerm(tag)}
                      className="px-3 py-1.5 bg-white border border-[#D5C2B8] rounded-full text-xs text-[#5C4D46] hover:border-[#763D8B] hover:text-[#763D8B] transition-colors cursor-pointer active:scale-[0.97]"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6E5A69]">
              No encontramos productos que coincidan con "{searchTerm}".
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  onClose();
                }}
                className="flex items-center gap-4 p-3 bg-white hover:bg-[#FAF4F7] rounded-xl border border-[#EDE5DF] hover:border-[#763D8B]/30 cursor-pointer transition-[border-color,background-color] duration-150 group"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#EAE2DC] shrink-0">
                  <img
                    src={p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=200&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-sm font-medium text-[#241A23] truncate group-hover:text-[#763D8B] transition-colors">
                    {p.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-[#6E5A69] mt-0.5">
                    <span>${(p.available_for_rental && p.rental_price ? p.rental_price : p.price).toFixed(2)}</span>
                    {p.available_for_rental && <span className="text-[#435C4E]">· Alquiler</span>}
                    {p.gift_type === 'fixed' && <span>· Regalo Fijo</span>}
                    {p.gift_type === 'variable' && <span className="text-[#763D8B] font-medium">· Personalizable</span>}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A89890] group-hover:text-[#763D8B] group-hover:translate-x-1 transition-[transform,color] duration-150" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
