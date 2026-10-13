import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem, GiftCustomization } from '../types/database';

export interface CartItem extends OrderItem {
  product: Product;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number, options?: {
    isRental?: boolean;
    rentalStartDate?: string;
    rentalEndDate?: string;
    variant?: string;
    dedication?: string;
    customization?: GiftCustomization;
    customPrice?: number;
  }) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ballonsdei_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (
    product: Product,
    quantity: number = 1,
    options?: {
      isRental?: boolean;
      rentalStartDate?: string;
      rentalEndDate?: string;
      variant?: string;
      dedication?: string;
      customization?: GiftCustomization;
      customPrice?: number;
    }
  ) => {
    const isRental = options?.isRental || product.available_for_rental;
    const basePrice = isRental && product.rental_price ? product.rental_price : product.price;
    const unitPrice = options?.customPrice !== undefined ? options.customPrice : basePrice;
    
    // Create distinct variant key if customized
    const variantKey = options?.customization
      ? `custom-${options.customization.balloonType || ''}-${options.customization.colorPalette || ''}-${options.customization.plushToy || ''}-${Date.now().toString().slice(-4)}`
      : options?.variant || 'standard';
      
    const mainImage = product.images?.[0]?.image_url || '';

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (it) => it.product_id === product.id && (it.selected_variant || 'standard') === variantKey
      );

      if (existingIndex > -1 && !options?.customization) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          total_price: newQty * unitPrice,
        };
        return updated;
      }

      const newItem: CartItem = {
        product_id: product.id,
        product_name: product.name,
        unit_price: unitPrice,
        quantity,
        total_price: unitPrice * quantity,
        image_url: mainImage,
        is_rental: isRental,
        rental_start_date: options?.rentalStartDate,
        rental_end_date: options?.rentalEndDate,
        selected_variant: variantKey,
        dedication_message: options?.dedication,
        customization: options?.customization,
        product,
      };

      return [...prev, newItem];
    });

    setIsOpen(true);
  };

  const removeItem = (productId: string, variant?: string) => {
    setItems((prev) =>
      prev.filter(
        (it) =>
          !(it.product_id === productId && (it.selected_variant || 'standard') === (variant || 'standard'))
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, variant?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variant);
      return;
    }
    setItems((prev) =>
      prev.map((it) => {
        if (
          it.product_id === productId &&
          (it.selected_variant || 'standard') === (variant || 'standard')
        ) {
          return {
            ...it,
            quantity,
            total_price: it.unit_price * quantity,
          };
        }
        return it;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
