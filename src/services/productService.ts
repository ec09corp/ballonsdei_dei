import { supabase, isSupabaseConfigured, uploadProductImage } from '../lib/supabase';
import { Product, ProductImage } from '../types/database';
import { INITIAL_PRODUCTS } from '../lib/mockData';

const LOCAL_PRODUCTS_KEY = 'balloonsdei_products_clean_v5';

// Purge old mock/demo storage keys once on load
if (typeof window !== 'undefined') {
  try {
    ['balloonsdei_products_clean_v4', 'balloonsdei_products_v3', 'balloonsdei_products'].forEach((k) => {
      if (localStorage.getItem(k) !== null) {
        localStorage.removeItem(k);
      }
    });
  } catch {}
}

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local products:', e);
  }
  return [];
}

function notifyDataUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('balloonsdei_data_updated'));
  }
}

function saveLocalProducts(products: Product[], notify: boolean = true) {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
    if (notify) {
      notifyDataUpdate();
    }
  } catch (e) {
    console.error('Error saving local products:', e);
  }
}


export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const productService = {
  async getProducts(params?: {
    categorySlug?: string;
    giftType?: 'fixed' | 'variable';
    isRental?: boolean;
    activeOnly?: boolean;
    search?: string;
  }): Promise<Product[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        let rawData: any[] | null = null;

        // Try primary query with embedded images and categories
        let primaryQuery = supabase
          .from('products')
          .select(`
            *,
            images:product_images(*),
            category:categories(*)
          `)
          .order('created_at', { ascending: false });

        if (params?.activeOnly !== false) {
          primaryQuery = primaryQuery.eq('active', true);
        }
        if (params?.giftType) {
          primaryQuery = primaryQuery.eq('gift_type', params.giftType);
        }
        if (params?.isRental) {
          primaryQuery = primaryQuery.eq('available_for_rental', true);
        }

        const { data: primaryData, error: primaryError } = await primaryQuery;

        if (!primaryError && primaryData) {
          rawData = primaryData;
        } else {
          // Fallback query without embedded category (in case of missing PostgREST foreign key relationship)
          let fallbackQuery = supabase
            .from('products')
            .select(`
              *,
              images:product_images(*)
            `)
            .order('created_at', { ascending: false });

          if (params?.activeOnly !== false) {
            fallbackQuery = fallbackQuery.eq('active', true);
          }
          if (params?.giftType) {
            fallbackQuery = fallbackQuery.eq('gift_type', params.giftType);
          }
          if (params?.isRental) {
            fallbackQuery = fallbackQuery.eq('available_for_rental', true);
          }

          const { data: fallbackData } = await fallbackQuery;
          if (fallbackData) {
            rawData = fallbackData;
          }
        }

        if (rawData) {
          // Sort images by position 1..4
          let products = rawData.map((p) => {
            const sortedImages = (p.images || []).sort(
              (a: ProductImage, b: ProductImage) => (a.position || 1) - (b.position || 1)
            );
            const metadata = p.metadata || {};
            const availType = p.availability_type || metadata.availability_type || (p.gift_type === 'variable' ? 'reservation' : 'ready_now');
            const prepDays = p.preparation_days ?? metadata.preparation_days ?? (availType === 'reservation' ? 3 : 0);
            const variants = p.variants || metadata.variants || [];
            return {
              ...p,
              variants,
              availability_type: availType,
              preparation_days: prepDays,
              images: sortedImages,
            };
          });

          // Merge local products so any newly created product that isn't yet in Supabase NEVER disappears!
          const localProducts = getLocalProducts();
          const localOnly = localProducts.filter((lp) => !products.some((sp) => sp.id === lp.id));
          const allProducts = [...products, ...localOnly];

          let filtered = allProducts;
          if (params?.categorySlug) {
            filtered = filtered.filter(
              (p) => p.category?.slug === params.categorySlug || p.category_id === params.categorySlug
            );
          }

          if (params?.search) {
            const s = params.search.toLowerCase();
            filtered = filtered.filter(
              (p) =>
                p.name.toLowerCase().includes(s) ||
                p.description.toLowerCase().includes(s) ||
                (p.tags && String(p.tags).toLowerCase().includes(s))
            );
          }

          // Cache in local storage for fast fallback (silent, do not trigger refresh loop)
          saveLocalProducts(allProducts, false);
          return filtered;
        }
      } catch (err) {
        console.warn('Supabase query failed, using local product catalog:', err);
      }
    }


    // Fallback to local catalog
    let list = getLocalProducts();

    if (params?.activeOnly !== false) {
      list = list.filter((p) => p.active);
    }
    if (params?.giftType) {
      list = list.filter((p) => p.gift_type === params.giftType);
    }
    if (params?.isRental) {
      list = list.filter((p) => p.available_for_rental);
    }
    if (params?.categorySlug) {
      list = list.filter(
        (p) =>
          p.category_id === `cat-${params.categorySlug}` ||
          p.category_id === params.categorySlug ||
          p.category?.slug === params.categorySlug
      );
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          (p.tags && String(p.tags).toLowerCase().includes(s))
      );
    }

    return list;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            images:product_images(*),
            category:categories(*)
          `)
          .eq('slug', slug)
          .maybeSingle();

        if (!error && data) {
          const sortedImages = (data.images || []).sort(
            (a: ProductImage, b: ProductImage) => a.position - b.position
          );
          return { ...data, images: sortedImages };
        }
      } catch (err) {
        console.warn('Error fetching product by slug from Supabase:', err);
      }
    }

    const local = getLocalProducts().find((p) => p.slug === slug);
    return local || null;
  },

  async createProduct(
    productData: Partial<Product>,
    imageFiles: { file?: File; url: string; position: 1 | 2 | 3 | 4 }[]
  ): Promise<{ product: Product | null; error: Error | null; savedLocally?: boolean }> {
    const slug =
      productData.slug ||
      (productData.name || 'producto')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newId = generateUuid();
    let createdProductInDb: Product | null = null;
    let dbError: Error | null = null;
    const cleanCatId = (productData.category_id && productData.category_id.trim()) ? productData.category_id.trim() : null;

    if (supabase && isSupabaseConfigured) {
      try {

        // Ensure category exists to avoid Foreign Key violations in Supabase
        if (cleanCatId) {
          try {
            const { data: catExists } = await supabase
              .from('categories')
              .select('id')
              .eq('id', cleanCatId)
              .maybeSingle();

            if (!catExists) {
              const catName = cleanCatId.replace('cat-', '').replace(/-/g, ' ');
              await supabase.from('categories').insert({
                id: cleanCatId,
                name: catName.charAt(0).toUpperCase() + catName.slice(1),
                slug: cleanCatId.replace('cat-', ''),
                active: true,
              });
            }
          } catch (cErr) {
            console.warn('Could not verify/create category in Supabase:', cErr);
          }
        }

        const insertPayload: any = {
          id: newId,
          name: productData.name,
          slug,
          description: productData.description || '',
          price: Number(productData.price) || 0,
          previous_price: productData.previous_price ? Number(productData.previous_price) : null,
          sku: productData.sku || `BD-${Date.now().toString().slice(-4)}`,
          category_id: cleanCatId,
          product_type: productData.product_type || 'product',
          gift_type: productData.gift_type || 'none',
          stock: Number(productData.stock) || 0,
          minimum_stock: Number(productData.minimum_stock) || 2,
          active: productData.active ?? true,
          featured: productData.featured ?? false,
          is_new: productData.is_new ?? true,
          available_for_rental: productData.available_for_rental ?? false,
          rental_price: productData.rental_price ? Number(productData.rental_price) : null,
          rental_deposit: productData.rental_deposit ? Number(productData.rental_deposit) : null,
          rental_conditions: productData.rental_conditions || null,
          size: productData.size || null,
          color: productData.color || null,
          tags: productData.tags || null,
          variants: productData.variants || [],
          metadata: {
            ...(productData.metadata || {}),
            variants: productData.variants || [],
            availability_type: productData.availability_type || (productData.gift_type === 'variable' ? 'reservation' : 'ready_now'),
            preparation_days: productData.preparation_days ?? (productData.availability_type === 'reservation' ? 3 : 0),
          },
        };

        let { data: insertedProduct, error: prodError } = await supabase
          .from('products')
          .insert(insertPayload)
          .select()
          .maybeSingle();

        // If insert failed due to column not existing in Supabase yet, retry without new optional columns
        if (prodError && (prodError.message?.includes('variants') || prodError.message?.includes('column') || prodError.message?.includes('availability_type'))) {
          console.warn('Retrying insert without newer columns:', prodError.message);
          const sanitizedPayload = { ...insertPayload };
          delete sanitizedPayload.variants;
          delete sanitizedPayload.availability_type;
          delete sanitizedPayload.preparation_days;
          const retryRes = await supabase
            .from('products')
            .insert(sanitizedPayload)
            .select()
            .maybeSingle();

          if (!retryRes.error && retryRes.data) {
            insertedProduct = retryRes.data;
            prodError = null;
          }
        }

        if (prodError) {
          console.warn('Supabase product insert notice:', prodError.message || prodError);
          dbError = new Error(prodError.message || 'Error guardando en Supabase');
        } else if (insertedProduct) {
          const productId = insertedProduct.id;

          // Attempt to insert variants into product_variants table if provided
          if (productData.variants && productData.variants.length > 0) {
            try {
              const variantRows = productData.variants.map((v) => ({
                id: generateUuid(),
                product_id: productId,
                name: v.name,
                price: Number(v.price) || 0,
                sku: v.sku || null,
                stock: v.stock ?? 10,
                is_default: Boolean(v.is_default),
              }));
              await supabase.from('product_variants').insert(variantRows);
            } catch (vErr) {
              console.warn('Could not insert product_variants table (using JSONB column/metadata):', vErr);
            }
          }

          const uploadedImages: ProductImage[] = [];

          // Upload all images in parallel for ultra-fast creation
          const imageUploadResults = await Promise.all(
            imageFiles.slice(0, 4).map(async (img) => {
              let finalUrl = img.url;
              if (img.file) {
                const { url } = await uploadProductImage(img.file, productId, img.position, img.url);
                if (url) finalUrl = url;
              }
              return {
                product_id: productId,
                image_url: finalUrl,
                position: img.position,
              };
            })
          );

          // Batch insert images into Supabase in a single instant query
          const validImageRows = imageUploadResults.filter((img) => Boolean(img.image_url));
          if (validImageRows.length > 0) {
            try {
              const { data: batchData } = await supabase
                .from('product_images')
                .insert(validImageRows)
                .select();
              if (batchData && batchData.length > 0) {
                uploadedImages.push(...batchData);
              } else {
                uploadedImages.push(
                  ...validImageRows.map((r, i) => ({ id: `img-${Date.now()}-${i}`, ...r }))
                );
              }
            } catch {
              uploadedImages.push(
                ...validImageRows.map((r, i) => ({ id: `img-${Date.now()}-${i}`, ...r }))
              );
            }
          }

          createdProductInDb = {
            ...insertedProduct,
            images: uploadedImages.sort((a, b) => a.position - b.position),
          };
        }
      } catch (err: any) {
        console.warn('Supabase connection notice in createProduct:', err.message || err);
        dbError = err;
      }
    }

    // Build the final complete product for local state
    const processedImages: ProductImage[] = [];
    for (let i = 0; i < imageFiles.slice(0, 4).length; i++) {
      const img = imageFiles[i];
      let finalUrl = img.url;
      processedImages.push({
        id: `img-${Date.now()}-${i}`,
        product_id: createdProductInDb ? createdProductInDb.id : newId,
        image_url: finalUrl,
        position: img.position,
      });
    }

    const finalProduct: Product = createdProductInDb || {
      id: newId,
      name: productData.name || 'Nuevo Producto',
      slug,
      description: productData.description || '',
      price: Number(productData.price) || 0,
      previous_price: productData.previous_price ? Number(productData.previous_price) : null,
      sku: productData.sku || `BD-${Date.now().toString().slice(-4)}`,
      category_id: cleanCatId || productData.category_id || '',
      product_type: productData.product_type || 'product',
      gift_type: productData.gift_type || 'none',
      availability_type: productData.availability_type || (productData.gift_type === 'variable' ? 'reservation' : 'ready_now'),
      preparation_days: productData.preparation_days ?? (productData.availability_type === 'reservation' ? 3 : 0),
      stock: Number(productData.stock) || 0,
      minimum_stock: Number(productData.minimum_stock) || 2,
      active: productData.active ?? true,
      featured: productData.featured ?? false,
      is_new: productData.is_new ?? true,
      available_for_rental: productData.available_for_rental ?? false,
      rental_price: productData.rental_price ? Number(productData.rental_price) : null,
      rental_deposit: productData.rental_deposit ? Number(productData.rental_deposit) : null,
      rental_conditions: productData.rental_conditions || null,
      size: productData.size || null,
      color: productData.color || null,
      tags: productData.tags || null,
      variants: productData.variants || [],
      metadata: {
        ...(productData.metadata || {}),
        variants: productData.variants || [],
        availability_type: productData.availability_type || (productData.gift_type === 'variable' ? 'reservation' : 'ready_now'),
        preparation_days: productData.preparation_days ?? (productData.availability_type === 'reservation' ? 3 : 0),
      },
      images: processedImages,
    };

    // Save into local cache so it always appears instantly without reload errors
    const currentLocal = getLocalProducts().filter((p) => p.id !== finalProduct.id);
    saveLocalProducts([finalProduct, ...currentLocal]);

    return { 
      product: finalProduct, 
      error: dbError,
      savedLocally: !createdProductInDb 
    };
  },

  async updateProduct(
    id: string,
    productData: Partial<Product>,
    imageFiles?: { file?: File; url: string; position: 1 | 2 | 3 | 4 }[]
  ): Promise<{ product: Product | null; error: Error | null }> {
    let dbError: Error | null = null;
    const cleanCatId = (productData.category_id && productData.category_id.trim()) ? productData.category_id.trim() : null;

    if (supabase && isSupabaseConfigured) {
      try {
        const updatePayload: any = {
          name: productData.name,
          description: productData.description,
          price: Number(productData.price),
          previous_price: productData.previous_price ? Number(productData.previous_price) : null,
          sku: productData.sku,
          category_id: cleanCatId,
          product_type: productData.product_type,
          gift_type: productData.gift_type,
          stock: Number(productData.stock),
          minimum_stock: Number(productData.minimum_stock),
          active: productData.active,
          featured: productData.featured,
          is_new: productData.is_new,
          available_for_rental: productData.available_for_rental,
          rental_price: productData.rental_price ? Number(productData.rental_price) : null,
          rental_deposit: productData.rental_deposit ? Number(productData.rental_deposit) : null,
          rental_conditions: productData.rental_conditions,
          size: productData.size,
          color: productData.color,
          tags: productData.tags,
          variants: productData.variants || [],
          metadata: {
            ...(productData.metadata || {}),
            variants: productData.variants || [],
            availability_type: productData.availability_type,
            preparation_days: productData.preparation_days,
          },
        };

        const { error: prodError } = await supabase
          .from('products')
          .update(updatePayload)
          .eq('id', id);

        if (prodError) {
          console.warn('Supabase update notice:', prodError.message);
          dbError = new Error(prodError.message);
        } else {
          // Sync variants table if available
          if (productData.variants) {
            try {
              await supabase.from('product_variants').delete().eq('product_id', id);
              if (productData.variants.length > 0) {
                const variantRows = productData.variants.map((v) => ({
                  id: generateUuid(),
                  product_id: id,
                  name: v.name,
                  price: Number(v.price) || 0,
                  sku: v.sku || null,
                  stock: v.stock ?? 10,
                  is_default: Boolean(v.is_default),
                }));
                await supabase.from('product_variants').insert(variantRows);
              }
            } catch (vErr) {
              console.warn('Could not sync product_variants table:', vErr);
            }
          }
        }

        if (imageFiles && imageFiles.length > 0) {
          // Remove old images
          await supabase.from('product_images').delete().eq('product_id', id);

          // Upload up to 4 images in parallel
          const imageResults = await Promise.all(
            imageFiles.slice(0, 4).map(async (img) => {
              let finalUrl = img.url;
              if (img.file) {
                const { url } = await uploadProductImage(img.file, id, img.position, img.url);
                if (url) finalUrl = url;
              }
              return {
                product_id: id,
                image_url: finalUrl,
                position: img.position,
              };
            })
          );

          const validRows = imageResults.filter((img) => Boolean(img.image_url));
          if (validRows.length > 0) {
            await supabase.from('product_images').insert(validRows);
          }
        }
      } catch (err: any) {
        console.warn('Supabase update warning:', err);
        dbError = err;
      }
    }

    // Always update local cache as well
    const localList = getLocalProducts().map((p) => {
      if (p.id === id) {
        let updatedImages = p.images || [];
        if (imageFiles && imageFiles.length > 0) {
          updatedImages = imageFiles.slice(0, 4).map((img, i) => ({
            id: `img-${Date.now()}-${i}`,
            product_id: id,
            image_url: img.url,
            position: img.position,
          }));
        }
        return {
          ...p,
          ...productData,
          category_id: cleanCatId || p.category_id,
          variants: productData.variants !== undefined ? productData.variants : p.variants,
          availability_type: productData.availability_type || p.availability_type,
          preparation_days: productData.preparation_days !== undefined ? productData.preparation_days : p.preparation_days,
          images: updatedImages,
        };
      }
      return p;
    });

    saveLocalProducts(localList);
    const updated = localList.find((p) => p.id === id) || null;
    return { product: updated, error: dbError };
  },

  async updateStock(id: string, newStock: number): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('products')
          .update({ stock: Math.max(0, newStock) })
          .eq('id', id);
      } catch (err) {
        console.warn('Error updating stock in Supabase:', err);
      }
    }

    const current = getLocalProducts().map((p) => {
      if (p.id === id) {
        return { ...p, stock: Math.max(0, newStock) };
      }
      return p;
    });
    saveLocalProducts(current);
    return true;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        // Delete child rows first so foreign keys never block deletion in Supabase
        await Promise.allSettled([
          supabase.from('product_variants').delete().eq('product_id', id),
          supabase.from('product_images').delete().eq('product_id', id),
          supabase.from('product_production_items').delete().eq('product_id', id),
          supabase.from('custom_designs').delete().eq('base_product_id', id),
          supabase.from('custom_designs').delete().eq('product_id', id),
        ]);
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) console.error('Error deleting product from Supabase:', error);
      } catch (err) {
        console.error('Error in deleteProduct with Supabase:', err);
      }
    }

    const current = getLocalProducts();
    const filtered = current.filter((p) => p.id !== id);
    saveLocalProducts(filtered);
    return true;
  },

  async deleteAllProducts(): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        await Promise.allSettled([
          supabase.from('product_variants').delete().neq('id', 'placeholder'),
          supabase.from('product_images').delete().neq('id', 'placeholder'),
          supabase.from('product_production_items').delete().neq('id', 'placeholder'),
        ]);
        await supabase.from('products').delete().neq('id', 'placeholder');
      } catch (err) {
        console.warn('Error clearing products in Supabase:', err);
      }
    }
    saveLocalProducts([]);
    return true;
  },

  async clearAllCatalog(): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        // Clean all dependent tables in strict dependency order so no Foreign Key prevents deletion
        await Promise.allSettled([
          supabase.from('production_movements').delete().neq('id', 'placeholder'),
          supabase.from('product_production_items').delete().neq('id', 'placeholder'),
          supabase.from('product_variants').delete().neq('id', 'placeholder'),
          supabase.from('product_images').delete().neq('id', 'placeholder'),
          supabase.from('custom_designs').delete().neq('id', 'placeholder'),
          supabase.from('customizer_elements').delete().neq('id', 'placeholder'),
        ]);
        await supabase.from('production_items').delete().neq('id', 'placeholder');
        await supabase.from('products').delete().neq('id', 'placeholder');
        await supabase.from('categories').delete().neq('id', 'placeholder');
      } catch (err) {
        console.warn('Error clearing entire catalog in Supabase:', err);
      }
    }
    try {
      [
        'balloonsdei_products_clean_v5',
        'balloonsdei_categories_clean_v5',
        'balloonsdei_products_clean_v4',
        'balloonsdei_categories_clean_v4',
        'balloonsdei_products_v3',
        'balloonsdei_categories_v3',
        'balloonsdei_products',
        'balloonsdei_categories',
        'balloonsdei_prod_items_v2',
        'balloonsdei_prod_movements_v2',
        'balloonsdei_prod_relations_v2',
        'balloonsdei_customizer_elements_v1',
        'balloonsdei_customizer_designs_v1',
      ].forEach((k) => localStorage.removeItem(k));
    } catch {}
    saveLocalProducts([]);
    notifyDataUpdate();
    return true;
  },

  async resetToDefaults(): Promise<Product[]> {
    saveLocalProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  async syncAllProductsToSupabase(): Promise<{ success: boolean; syncedCount: number; error: string | null }> {
    if (!supabase || !isSupabaseConfigured) {
      return { 
        success: false, 
        syncedCount: 0, 
        error: 'Supabase no está configurado aún. Ve a Ajustes > Supabase para ingresar tu URL y clave anónima.' 
      };
    }

    const localList = getLocalProducts();
    if (localList.length === 0) {
      return { success: true, syncedCount: 0, error: null };
    }

    let syncedCount = 0;
    let lastError: string | null = null;

    for (const prod of localList) {
      try {
        const cleanCatId = (prod.category_id && prod.category_id.trim()) ? prod.category_id.trim() : null;
        if (cleanCatId) {
          try {
            const { data: catExists } = await supabase
              .from('categories')
              .select('id')
              .eq('id', cleanCatId)
              .maybeSingle();

            if (!catExists) {
              const catName = cleanCatId.replace('cat-', '').replace(/-/g, ' ');
              await supabase.from('categories').insert({
                id: cleanCatId,
                name: catName.charAt(0).toUpperCase() + catName.slice(1),
                slug: cleanCatId.replace('cat-', ''),
                active: true,
              });
            }
          } catch {}
        }

        const payload: any = {
          id: prod.id,
          name: prod.name,
          slug: prod.slug,
          description: prod.description || '',
          price: Number(prod.price) || 0,
          previous_price: prod.previous_price ? Number(prod.previous_price) : null,
          sku: prod.sku || `BD-${Date.now().toString().slice(-4)}`,
          category_id: cleanCatId,
          product_type: prod.product_type || 'product',
          gift_type: prod.gift_type || 'none',
          stock: Number(prod.stock) || 0,
          minimum_stock: Number(prod.minimum_stock) || 2,
          active: prod.active ?? true,
          featured: prod.featured ?? false,
          is_new: prod.is_new ?? true,
          available_for_rental: prod.available_for_rental ?? false,
          rental_price: prod.rental_price ? Number(prod.rental_price) : null,
          rental_deposit: prod.rental_deposit ? Number(prod.rental_deposit) : null,
          rental_conditions: prod.rental_conditions || null,
          size: prod.size || null,
          color: prod.color || null,
          tags: prod.tags || null,
        };

        const { error: upsertErr } = await supabase
          .from('products')
          .upsert(payload);

        if (upsertErr) {
          lastError = upsertErr.message;
        } else {
          syncedCount++;
          if (prod.images && prod.images.length > 0) {
            await supabase.from('product_images').delete().eq('product_id', prod.id);
            for (const img of prod.images.slice(0, 4)) {
              if (img.image_url) {
                await supabase.from('product_images').insert({
                  product_id: prod.id,
                  image_url: img.image_url,
                  position: img.position || 1,
                });
              }
            }
          }
        }
      } catch (err: any) {
        lastError = err.message || String(err);
      }
    }

    return {
      success: syncedCount > 0 || !lastError,
      syncedCount,
      error: lastError,
    };
  },
};
