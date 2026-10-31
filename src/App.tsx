import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { LuxuryMarquee } from './components/LuxuryMarquee';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SearchModal } from './components/SearchModal';
import { LocationSection } from './components/LocationSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CategoriesSection } from './components/CategoriesSection';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminInventory } from './components/admin/AdminInventory';
import { AdminProduction } from './components/admin/AdminProduction';
import { AdminRentals } from './components/admin/AdminRentals';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminCustomizerElements } from './components/admin/AdminCustomizerElements';
import { AdminExtras } from './components/admin/AdminExtras';
import { ArrangementCustomizerModal } from './components/customizer/ArrangementCustomizerModal';
import { MobileBallonsdeiAtmosphere } from './components/MobileBallonsdeiAtmosphere';
import { PWAInstallBanner } from './components/PWAInstallBanner';

// Services & Data
import { productService } from './services/productService';
import { categoryService } from './services/categoryService';
import { orderService } from './services/orderService';
import { productionService } from './services/productionService';
import { settingsService } from './services/settingsService';
import { 
  Product, 
  Category, 
  Order, 
  ProductionItem, 
  StoreSettings, 
  isProductReadyNow, 
  isProductReservation 
} from './types/database';
import { INITIAL_SETTINGS } from './lib/mockData';
import { Gift, SlidersHorizontal, Sparkles } from 'lucide-react';

function MainApp() {
  const { isAdmin } = useAuth();

  const checkIsAdmin = () => {
    return (
      window.location.hash.startsWith('#admin') ||
      window.location.search.includes('admin')
    );
  };

  // App routing state
  const [isAdminView, setIsAdminView] = useState(() => checkIsAdmin());
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Storefront state
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & modal states
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeNav, setActiveNav] = useState<string>('hero');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerBaseProduct, setCustomizerBaseProduct] = useState<Product | null>(null);

  const handleOpenCustomizer = (product?: Product) => {
    setCustomizerBaseProduct(product || selectedProduct || products[0] || null);
    setIsCustomizerOpen(true);
  };

  // Sync hash with admin view and support Ctrl+Shift+A secret hotkey
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(checkIsAdmin());
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.location.hash = window.location.hash.startsWith('#admin') ? '' : '#admin';
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const loadAllData = async (isSilent: boolean = false) => {
    if (!isSilent) {
      setIsLoading(true);
    }
    try {
      const fetchedCats = await categoryService.getCategories();
      setCategories(fetchedCats);

      const [fetchedSettings, fetchedProds, fetchedOrders, fetchedProdItems] =
        await Promise.all([
          settingsService.getSettings(),
          productService.getProducts({ activeOnly: false }),
          orderService.getOrders(),
          productionService.getItems(),
        ]);

      setSettings(fetchedSettings);

      // Populate category relation for every product so category views match reliably
      const enrichedProds = fetchedProds.map((p) => {
        const cat = fetchedCats.find((c) => c.id === p.category_id || c.slug === p.category_id);
        return {
          ...p,
          category: p.category || cat,
        };
      });

      setProducts(enrichedProds);
      setOrders(fetchedOrders);
      setProductionItems(fetchedProdItems);
    } catch (err) {
      console.error('Error loading store data:', err);
    } finally {
      if (!isSilent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadAllData(false);

    // Listen to real-time local updates dispatched from admin with debounce & silent refresh
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const handleDataUpdate = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadAllData(true);
      }, 300);
    };
    window.addEventListener('balloonsdei_data_updated', handleDataUpdate);
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('balloonsdei_data_updated', handleDataUpdate);
    };
  }, []);

  const handleNavigate = (sectionId: string, categorySlug?: string) => {
    if (categorySlug) {
      setActiveCategoryFilter(categorySlug);
      setActiveNav(categorySlug);
      const catEl = document.getElementById('catalogo');
      if (catEl) {
        catEl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setActiveNav(sectionId);
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleOpenAdmin = () => {
    window.location.hash = '#admin';
    setIsAdminView(true);
  };

  const handleExitAdmin = () => {
    window.location.hash = '';
    setIsAdminView(false);
    loadAllData(true); // Quietly refresh latest products and categories without full-screen flicker
  };

  // Filter storefront products
  const displayProducts = products.filter((p) => {
    if (!p.active) return false;
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'para-ya' || activeCategoryFilter === 'regalos-fijos') {
      return isProductReadyNow(p);
    }
    if (activeCategoryFilter === 'por-reserva' || activeCategoryFilter === 'personalizables' || activeCategoryFilter === 'regalos-variables') {
      return isProductReservation(p);
    }
    const cat = categories.find((c) => c.id === p.category_id || c.slug === p.category_id);
    return (
      p.category?.slug === activeCategoryFilter ||
      cat?.slug === activeCategoryFilter ||
      p.category_id === activeCategoryFilter ||
      p.category_id === `cat-${activeCategoryFilter}` ||
      (Array.isArray(p.tags)
        ? p.tags.includes(activeCategoryFilter)
        : p.tags && String(p.tags).toLowerCase().includes(activeCategoryFilter.toLowerCase()))
    );
  });

  // ADMIN VIEW
  if (isAdminView) {
    if (!isAdmin) {
      return (
        <AdminLogin
          onBackToStore={handleExitAdmin}
          onLoginSuccess={() => setIsAdminView(true)}
        />
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={setAdminTab}
        onGoToStore={handleExitAdmin}
        settings={settings}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            orders={orders}
            products={products}
            productionItems={productionItems}
            onNavigateTab={setAdminTab}
          />
        )}
        {adminTab === 'orders' && (
          <AdminOrders
            orders={orders}
            onRefreshOrders={loadAllData}
          />
        )}
        {adminTab === 'products' && (
          <AdminProducts
            products={products}
            categories={categories}
            onRefresh={loadAllData}
          />
        )}
        {adminTab === 'categories' && (
          <AdminCategories
            categories={categories}
            onRefresh={loadAllData}
          />
        )}
        {adminTab === 'extras' && (
          <AdminExtras />
        )}
        {adminTab === 'customizer' && (
          <AdminCustomizerElements />
        )}
        {adminTab === 'inventory' && (
          <AdminInventory
            products={products}
            onRefresh={loadAllData}
          />
        )}
        {adminTab === 'production' && (
          <AdminProduction
            products={products}
          />
        )}
        {adminTab === 'rentals' && (
          <AdminRentals
            products={products}
          />
        )}
        {adminTab === 'settings' && (
          <AdminSettings
            settings={settings}
            onRefreshSettings={loadAllData}
          />
        )}
      </AdminLayout>
    );
  }

  // PUBLIC STOREFRONT VIEW
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#241A23] flex flex-col font-sans pb-16 sm:pb-0">
      {/* Accessible Skip Link (A11y WCAG AA) */}
      <a 
        href="#catalogo" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-white focus:text-[#763D8B] focus:font-semibold focus:shadow-xl focus:rounded-lg focus:border focus:border-[#763D8B]"
      >
        Saltar al catálogo de productos
      </a>

      {/* Ambient Mobile Balloons, Ballonsdei Watermarks & Bottom Action Bar */}
      <MobileBallonsdeiAtmosphere
        settings={settings}
        onOpenCustomizer={() => handleOpenCustomizer()}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigateToCatalog={() => handleNavigate('catalogo', 'all')}
      />

      {/* PWA Install Banner & iOS Safari Add to Home Screen Modal */}
      <PWAInstallBanner />

      {/* Header with glassmorphism */}
      <Header
        settings={settings}
        categories={categories}
        activeNav={activeNav}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenCustomizer={() => handleOpenCustomizer()}
      />

      {/* Hero Section with Parallax & 3D Interactive Card Tilt */}
      <Hero
        settings={settings}
        onExplore={(cat) => handleNavigate('catalogo', cat)}
        onOpenCustomizer={() => handleOpenCustomizer()}
      />

      {/* Infinite Luxury Silk Marquee */}
      <LuxuryMarquee />

      {/* Visual Collections Showcase by Category (Images from Gallery) */}
      <CategoriesSection
        categories={categories.filter((c) => c.active)}
        selectedCategory={activeCategoryFilter}
        onSelectCategory={(slug) => handleNavigate('catalogo', slug)}
      />

      {/* Main Catalog - Haute Floristerie Showcase */}
      <main id="catalogo" className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full py-8 sm:py-16">
        {/* Rolex-Style Category Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 mb-8 sm:mb-10 pb-5 sm:pb-6 border-b border-[#EAE3DC]">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#C5A059] uppercase">
              <span>✦</span>
              <span>COLLECTIONS PRIVÉES</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#241A23] font-light tracking-tight">
              {activeCategoryFilter === 'all'
                ? 'Catálogo General de Autor'
                : categories.find((c) => c.slug === activeCategoryFilter)?.name || 'Catálogo'}
            </h2>
            <p className="text-xs sm:text-sm text-[#73636F] font-light">
              Mostrando {displayProducts.length} {displayProducts.length === 1 ? 'creación exclusiva' : 'creaciones exclusivas'} elaboradas bajo demanda con flores frescas y globos de importación.
            </p>
          </div>

          {/* Category Tabs with Gold Accent Indicators & Smooth Mobile Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('all')}
              className={`chip-spring px-4 py-2 rounded-full whitespace-nowrap font-medium cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-[#763D8B] text-white shadow-sm border border-[#763D8B]'
                  : 'bg-white text-stone-700 hover:bg-[#FAF4F7] border border-[#E4D7E0]'
              }`}
            >
              🌸 Todos los Diseños
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('para-ya')}
              className={`chip-spring px-4 py-2 rounded-full whitespace-nowrap font-medium cursor-pointer flex items-center gap-1.5 ${
                activeCategoryFilter === 'para-ya'
                  ? 'bg-amber-600 text-white shadow-sm border border-amber-600 font-semibold'
                  : 'bg-white text-stone-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <span>⚡ Para Ya (Inmediatos)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('por-reserva')}
              className={`chip-spring px-4 py-2 rounded-full whitespace-nowrap font-medium cursor-pointer flex items-center gap-1.5 ${
                activeCategoryFilter === 'por-reserva'
                  ? 'bg-[#763D8B] text-white shadow-sm border border-[#763D8B] font-semibold'
                  : 'bg-white text-stone-700 hover:bg-[#FAF4F7] border border-[#E4D7E0]'
              }`}
            >
              <span>📅 Por Reserva (Personalizables)</span>
            </button>
            {categories
              .filter((c) => c.active && c.slug !== 'regalos-fijos' && c.slug !== 'personalizables')
              .map((cat) => {
                const isCurrent = activeCategoryFilter === cat.slug;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setActiveCategoryFilter(cat.slug)}
                    className={`chip-spring px-4 py-2 rounded-full whitespace-nowrap font-medium cursor-pointer flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-[#763D8B] text-white shadow-sm border border-[#763D8B]'
                        : 'bg-white text-stone-700 hover:bg-[#FAF4F7] border border-[#E4D7E0]'
                    }`}
                  >
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt=""
                        className="w-4 h-4 rounded-full object-cover shrink-0 border border-white/40"
                      />
                    ) : (
                      <span>🌸</span>
                    )}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
          </div>
        </div>


        {/* Product Grid - Mobile Optimized Gaps */}
        {isLoading ? (
          <div className="py-24 text-center text-stone-500 text-sm font-light space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-[#763D8B] border-t-transparent rounded-full animate-spin" />
            <p>Cargando creaciones de Ballonsdei...</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-4 bg-white rounded-3xl p-8 border border-[#EAE3DC] shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF5F8] border border-[#E4D7E0] flex items-center justify-center text-[#763D8B]">
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-medium text-stone-900">No hay creaciones disponibles en esta sección</h3>
            <p className="text-xs text-stone-500 leading-relaxed font-light">
              {activeCategoryFilter === 'all'
                ? 'El catálogo se encuentra en preparación. Puedes agregar tus categorías y productos desde el panel de control.'
                : 'Aún no se han añadido productos en esta categoría.'}
            </p>
            {activeCategoryFilter === 'all' ? (
              <button
                onClick={handleOpenAdmin}
                className="btn-cta-emil mt-2 px-5 py-2.5 bg-[#763D8B] text-white text-xs font-semibold tracking-wider uppercase rounded-full cursor-pointer inline-flex items-center gap-2 shadow-sm"
              >
                <span>Ir al Panel y Crear Mi Primer Producto</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className="btn-cta-emil mt-2 px-5 py-2.5 bg-[#763D8B] text-white text-xs font-semibold tracking-wider uppercase rounded-full cursor-pointer"
              >
                Ver todas las creaciones
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onViewProduct={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Location / Visítanos Section */}
      <LocationSection settings={settings} />

      {/* Contact Section */}
      <ContactSection settings={settings} />

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigate={handleNavigate}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        relatedProducts={products.filter((p) => p.id !== selectedProduct?.id)}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenCustomizerStudio={(p) => {
          setSelectedProduct(null);
          handleOpenCustomizer(p);
        }}
      />

      {/* Master Interactive Visual Arrangement Customizer */}
      <ArrangementCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        baseProduct={customizerBaseProduct}
        allProducts={products}
        onSelectBaseProduct={(p) => setCustomizerBaseProduct(p)}
      />

      <CartDrawer
        settings={settings}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onCustomizeItem={(productId) => {
          const prod = products.find((p) => p.id === productId);
          if (prod) {
            handleOpenCustomizer(prod);
          } else {
            handleOpenCustomizer();
          }
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        settings={settings}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={() => {
          loadAllData();
        }}
      />

      <SearchModal
        isOpen={isSearchOpen}
        products={products}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
