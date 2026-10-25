import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle, 
  Truck, 
  Store, 
  CreditCard, 
  Calendar, 
  Send, 
  AlertCircle, 
  ShoppingCart, 
  Upload, 
  Copy, 
  Check, 
  Smartphone,
  MapPin,
  Sparkles,
  Printer,
  FileText,
  Landmark,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Receipt,
  Zap,
  Clock,
  CalendarDays
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { 
  StoreSettings, 
  Order, 
  isProductReadyNow, 
  isProductReservation, 
  getProductMinDeliveryDays 
} from '../types/database';
import { orderService } from '../services/orderService';
import { COLON_DISTRICTS, OrderExtraItem } from '../data/colonDelivery';
import { extrasService } from '../services/extrasService';

interface CheckoutModalProps {
  isOpen: boolean;
  settings: StoreSettings;
  onClose: () => void;
  onOrderCompleted?: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  settings,
  onClose,
  onOrderCompleted,
}) => {
  const { items, subtotal, clearCart } = useCart();

  // Reservation items check & minimum preparation time calculation
  const hasReservationItems = items.some((it) => isProductReservation(it.product));
  const maxPrepDays = items.reduce((max, it) => {
    return Math.max(max, getProductMinDeliveryDays(it.product));
  }, hasReservationItems ? 3 : 0);

  // Helper to generate ISO date string (YYYY-MM-DD)
  const getMinDateIso = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const minDate = getMinDateIso(hasReservationItems ? maxPrepDays : 0);

  // Contact fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(minDate);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');

  // Delivery in Colón province
  const [districtId, setDistrictId] = useState<string>('distrito-colon');
  const currentDistrict = COLON_DISTRICTS.find((d) => d.id === districtId) || COLON_DISTRICTS[0];
  const [corregimientoName, setCorregimientoName] = useState<string>(currentDistrict.corregimientos[0]?.name || 'Barrio Norte');
  const [addressDetails, setAddressDetails] = useState('');

  // Extras & Chocolates (dynamically loaded from extrasService)
  const [availableExtras, setAvailableExtras] = useState<OrderExtraItem[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<OrderExtraItem[]>([]);
  const [arrangementChanges, setArrangementChanges] = useState('');

  // Payment methods: Yappy, Transferencia Bancaria, Tarjeta
  const [paymentMethod, setPaymentMethod] = useState<'Yappy' | 'Transferencia' | 'Tarjeta'>('Yappy');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptRef, setReceiptRef] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [completedOrderExtras, setCompletedOrderExtras] = useState<OrderExtraItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  const receiptPrintRef = useRef<HTMLDivElement | null>(null);

  // Load available extras when modal opens & sync minDate
  useEffect(() => {
    if (isOpen) {
      setAvailableExtras(extrasService.getExtras());
      if (!deliveryDate || deliveryDate < minDate) {
        setDeliveryDate(minDate);
      }
    }
  }, [isOpen, minDate]);

  const formatSpanishDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('es-PA', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen) return null;

  // Selected Corregimiento pricing
  const currentCorregimiento = currentDistrict.corregimientos.find((c) => c.name === corregimientoName) || currentDistrict.corregimientos[0];
  const deliveryCost = deliveryType === 'delivery' ? (currentCorregimiento?.price || 4.00) : 0;
  const extrasTotal = selectedExtras.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = subtotal + extrasTotal + deliveryCost;

  const handleDistrictChange = (newDistrictId: string) => {
    setDistrictId(newDistrictId);
    const newDist = COLON_DISTRICTS.find((d) => d.id === newDistrictId) || COLON_DISTRICTS[0];
    if (newDist && newDist.corregimientos.length > 0) {
      setCorregimientoName(newDist.corregimientos[0].name);
    }
  };

  const toggleExtra = (extra: OrderExtraItem) => {
    if (selectedExtras.some((e) => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('El comprobante es muy grande (máximo 5MB).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setReceiptImage(ev.target.result as string);
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyReceiptImage = async () => {
    if (!receiptImage) return;
    try {
      const res = await fetch(receiptImage);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 3000);
    } catch {
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 3000);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg('Por favor completa tu nombre y número de teléfono.');
      return;
    }

    if (deliveryType === 'delivery' && !addressDetails.trim()) {
      setErrorMsg('Por favor ingresa la dirección exacta de entrega en el corregimiento seleccionado.');
      return;
    }

    if (!deliveryDate) {
      setErrorMsg('Por favor selecciona la fecha deseada para la entrega o retiro.');
      return;
    }

    if (deliveryDate < minDate) {
      setErrorMsg(`⚠️ Tu pedido incluye creaciones Por Reserva que requieren al menos ${maxPrepDays} días de anticipación. Por favor selecciona una fecha a partir del ${minDate}.`);
      return;
    }

    // MANDATORY RECEIPT VALIDATION: Block if no screenshot uploaded for Yappy or Transferencia!
    if ((paymentMethod === 'Yappy' || paymentMethod === 'Transferencia') && !receiptImage) {
      setErrorMsg(`⚠️ Es obligatorio subir la captura de pantalla del comprobante de pago (${paymentMethod === 'Yappy' ? 'Yappy' : 'Transferencia Bancaria'}) para confirmar y procesar el pedido.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const finalAddress = deliveryType === 'delivery'
        ? `Provincia de Colón, ${currentDistrict.name}, Corregimiento ${corregimientoName}. Dirección: ${addressDetails.trim()}`
        : `Retiro en Local Ballonsdei (Colón Centro - Calle 11 y Central)`;

      let fullNotes = notes.trim();
      if (arrangementChanges.trim()) {
        fullNotes = `[Cambios al arreglo: ${arrangementChanges.trim()}] ${fullNotes}`;
      }
      if (selectedExtras.length > 0) {
        const extrasNames = selectedExtras.map((e) => `${e.name} (+$${e.price.toFixed(2)})`).join(', ');
        fullNotes = `[Chocolates y Extras: ${extrasNames}] ${fullNotes}`;
      }

      // Convert selected extras into order items as well so they are recorded in database
      const extraOrderItems = selectedExtras.map((extra) => ({
        id: `extra-${Date.now()}-${extra.id}`,
        order_id: '',
        product_id: extra.id,
        product_name: `[Extra] ${extra.name}`,
        unit_price: extra.price,
        quantity: 1,
        total_price: extra.price,
        image_url: undefined,
      }));

      const allItemsToSave = [...items, ...extraOrderItems];

      const { order, error } = await orderService.createOrder(
        {
          customer_name: fullName.trim(),
          customer_email: email.trim() || 'cliente@ballonsdei.com',
          customer_phone: phone.trim(),
          delivery_address: finalAddress,
          delivery_date: deliveryDate,
          delivery_type: deliveryType,
          payment_method: paymentMethod === 'Transferencia' ? 'Transferencia Bancaria (Banco General)' : paymentMethod,
          notes: fullNotes,
          receipt_url: receiptImage,
          receipt_ref: receiptRef.trim() || null,
        },
        allItemsToSave,
        deliveryCost
      );

      if (error || !order) {
        throw error || new Error('No se pudo procesar el pedido');
      }

      setCompletedOrder(order);
      setCompletedOrderExtras([...selectedExtras]);
      clearCart();
      if (onOrderCompleted) {
        onOrderCompleted(order);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error registrando el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppSummaryUrl = (
    order: Order, 
    extrasList: OrderExtraItem[], 
    receiptRefParam?: string, 
    hasReceiptImage?: boolean
  ) => {
    const cleanPhone = (settings.whatsapp_number || '+50764324750').replace(/[^0-9]/g, '');
    
    // Separate regular products from extras in the message
    const mainItems = (order.order_items || []).filter((it) => !it.product_name.startsWith('[Extra]'));
    const productList = mainItems
      .map((it) => {
        let text = `• ${it.quantity}x ${it.product_name}`;
        if (it.selected_variant && it.selected_variant !== 'standard' && it.selected_variant !== 'Estándar' && !it.selected_variant.startsWith('custom-')) {
          text += ` [${it.selected_variant}]`;
        }
        text += ` — $${it.total_price.toFixed(2)}`;
        if (it.customization) {
          const c = it.customization;
          const details: string[] = [];
          if (c.balloonType) details.push(`  🎈 Globo: ${c.balloonType}`);
          if (c.balloonText) details.push(`  ✍️ Frase: "${c.balloonText}" (${c.vinylColor || 'Vinilo'})`);
          if (c.colorPalette) details.push(`  🎨 Colores: ${c.colorPalette}`);
          if (c.ribbonType) details.push(`  🎀 Lazo: ${c.ribbonType}`);
          if (c.plushToy && c.plushToy !== 'Sin peluche') details.push(`  🧸 Peluche: ${c.plushToy}`);
          if (details.length > 0) {
            text += '\n' + details.join('\n');
          }
        }
        if (it.dedication_message) {
          text += `\n  💌 Dedicatoria: "${it.dedication_message}"`;
        }
        return text;
      })
      .join('\n\n');

    let extrasText = '';
    if (extrasList.length > 0) {
      extrasText = `\n*Chocolates & Implementos Agregados:*\n` +
        extrasList.map((e) => `• 🍫 ${e.name}: +$${e.price.toFixed(2)}`).join('\n') + '\n';
    }

    const ref = receiptRefParam || order.receipt_ref || '';
    const hasImage = hasReceiptImage || !!order.receipt_url;

    let receiptSummary = '';
    if (order.payment_method.includes('Yappy')) {
      receiptSummary = `*Comprobante Yappy:* ${ref ? `Ref #${ref}` : ''} ${hasImage ? '(Captura de pantalla adjunta ✅)' : ''}\n`;
    } else if (order.payment_method.includes('Transferencia')) {
      receiptSummary = `*Comprobante Transferencia Bancaria:* ${ref ? `Ref #${ref}` : ''} ${hasImage ? '(Captura de comprobante adjunta ✅)' : ''}\n`;
    }

    const msg = `🧾 *RECIBO OFICIAL DE PEDIDO #${order.order_number}*\n` +
      `*BALLONSDEI — BOUTIQUE FLORAL (COLÓN)*\n` +
      `-------------------------------------------\n` +
      `*Cliente:* ${order.customer_name}\n` +
      `*Teléfono:* ${order.customer_phone}\n` +
      `*Fecha de Entrega/Retiro:* ${order.delivery_date}\n` +
      `*Modalidad:* ${order.delivery_type === 'delivery' ? 'Envío a domicilio en Provincia de Colón' : 'Retiro en Local Ballonsdei (Colón Centro)'}\n` +
      `*Destino:* ${order.delivery_address}\n` +
      `*Método de Pago:* ${order.payment_method}\n` +
      receiptSummary +
      `-------------------------------------------\n` +
      `*PRODUCTOS SOLICITADOS:*\n${productList}\n` +
      extrasText +
      `-------------------------------------------\n` +
      `*Subtotal Productos:* $${(order.subtotal || 0).toFixed(2)}\n` +
      (order.delivery_type === 'delivery' ? `*Costo de Envío (Colón):* $${deliveryCost.toFixed(2)}\n` : '') +
      `*TOTAL FINAL:* $${order.total.toFixed(2)}\n` +
      `-------------------------------------------\n` +
      (order.notes ? `*Detalles & Dedicatoria:*\n${order.notes}\n\n` : '') +
      (hasImage 
        ? `📸 *(Adjunto la captura del comprobante de pago)* 👇✨`
        : `Quedo atento a su confirmación y entrega. ¡Muchas gracias!`);

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCopyReceiptText = () => {
    if (!completedOrder) return;
    const cleanPhone = (settings.whatsapp_number || '+50764324750').replace(/[^0-9]/g, '');
    const textToCopy = `RECIBO OFICIAL DE PEDIDO #${completedOrder.order_number}\nBALLONSDEI CIUDAD DE COLÓN\nCliente: ${completedOrder.customer_name}\nTeléfono: ${completedOrder.customer_phone}\nFecha: ${completedOrder.delivery_date}\nDestino: ${completedOrder.delivery_address}\nMétodo: ${completedOrder.payment_method}\nTotal: $${completedOrder.total.toFixed(2)}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden my-0 sm:my-auto border-t sm:border border-[#E8DED7] flex flex-col max-h-[94dvh] sm:max-h-[92vh] animate-bottom-sheet sm:animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Top Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-white flex justify-center">
          <span className="w-12 h-1.5 bg-stone-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#EBE2DB] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-[#763D8B]" />
            <div>
              <h2 className="font-serif text-lg sm:text-2xl font-medium text-[#2E2421] leading-tight">
                {completedOrder ? 'Recibo Oficial de Pedido' : 'Finalizar Pedido'}
              </h2>
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#763D8B] font-semibold block">
                BALLONSDEI · COLÓN
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7A6B63] hover:text-[#2E2421] hover:bg-[#F2ECE6] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-6 flex-1">
          {completedOrder ? (
            /* DETAILED BOUTIQUE ORDER RECEIPT VIEW */
            <div className="space-y-6 animate-fade-in">
              <div ref={receiptPrintRef} className="bg-white rounded-2xl border-2 border-[#D4AF37]/35 p-6 sm:p-8 shadow-md space-y-6">
                {/* Official Receipt Header */}
                <div className="text-center pb-5 border-b border-dashed border-[#EAE3DC] space-y-1.5">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#7D5B28] block">
                    BALLONSDEI · CIUDAD DE COLÓN
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#241A23]">
                    Comprobante de Pedido
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-xs text-[#763D8B] font-bold pt-1">
                    <span>Orden N° #{completedOrder.order_number}</span>
                    <span>•</span>
                    <span className="text-[#6E5A69] font-normal">{new Date().toLocaleDateString('es-PA')}</span>
                  </div>
                </div>

                {/* Customer & Delivery Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FAF8F5] p-4 rounded-xl border border-[#EDE5DF]">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#7D5B28] tracking-wider block">
                      Datos del Cliente
                    </span>
                    <p className="flex items-center gap-1.5 text-[#2E2421] font-semibold">
                      <User className="w-3.5 h-3.5 text-[#763D8B]" />
                      <span>{completedOrder.customer_name}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[#55434F]">
                      <Phone className="w-3.5 h-3.5 text-[#763D8B]" />
                      <span>{completedOrder.customer_phone}</span>
                    </p>
                    {completedOrder.customer_email && (
                      <p className="flex items-center gap-1.5 text-[#7A6B63]">
                        <Mail className="w-3.5 h-3.5 text-[#763D8B]" />
                        <span>{completedOrder.customer_email}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#7D5B28] tracking-wider block">
                      Entrega en Colón
                    </span>
                    <p className="flex items-center gap-1.5 text-[#2E2421] font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-[#763D8B]" />
                      <span>Fecha: {completedOrder.delivery_date}</span>
                    </p>
                    <p className="flex items-start gap-1.5 text-[#55434F]">
                      <MapPin className="w-3.5 h-3.5 text-[#763D8B] shrink-0 mt-0.5" />
                      <span className="leading-tight">{completedOrder.delivery_address}</span>
                    </p>
                  </div>
                </div>

                {/* Itemized Products List */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B5A52] block border-b border-[#F2ECE6] pb-1.5">
                    Artículos & Creaciones Florales
                  </span>
                  <div className="divide-y divide-[#F5EFEB] space-y-2">
                    {(completedOrder.order_items || [])
                      .filter((it) => !it.product_name.startsWith('[Extra]'))
                      .map((it, idx) => (
                        <div key={idx} className="pt-2 flex justify-between items-start text-xs">
                          <div className="space-y-1 max-w-[340px]">
                            <p className="font-semibold text-[#2E2421]">
                              {it.quantity}x {it.product_name}
                              {it.selected_variant && it.selected_variant !== 'standard' && it.selected_variant !== 'Estándar' && !it.selected_variant.startsWith('custom-') && (
                                <span className="ml-1.5 text-[10px] font-bold text-[#763D8B] bg-[#FAF4F7] px-1.5 py-0.5 rounded border border-[#763D8B]/20 inline-block">
                                  {it.selected_variant}
                                </span>
                              )}
                            </p>
                            {it.customization && (
                              <div className="text-[10px] text-[#6E5A69] bg-stone-50 p-1.5 rounded border border-stone-200 space-y-0.5">
                                {it.customization.balloonText && (
                                  <p>✍️ Frase: "{it.customization.balloonText}" ({it.customization.vinylColor || 'Vinilo'})</p>
                                )}
                                {it.customization.balloonType && (
                                  <p>🎈 Globo: {it.customization.balloonType}</p>
                                )}
                                {it.customization.colorPalette && (
                                  <p>🎨 Paleta: {it.customization.colorPalette}</p>
                                )}
                              </div>
                            )}
                            {it.dedication_message && (
                              <p className="text-[10px] text-[#763D8B] italic">
                                💌 Tarjeta: "{it.dedication_message}"
                              </p>
                            )}
                          </div>
                          <span className="font-bold text-[#2E2421] shrink-0">
                            ${it.total_price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Itemized Extras/Chocolates */}
                {completedOrderExtras.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-[#F2ECE6]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B5A52] block pb-1">
                      🍫 Chocolates & Implementos Adicionales
                    </span>
                    <div className="space-y-1.5">
                      {completedOrderExtras.map((extra, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-[#423530]">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-[#C5A059]" />
                            <span>{extra.name}</span>
                          </span>
                          <span className="font-semibold text-[#763D8B]">
                            +${extra.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financial Summary */}
                <div className="pt-4 border-t-2 border-[#EBE2DB] space-y-2 text-xs">
                  <div className="flex justify-between text-[#6B5A52]">
                    <span>Subtotal Productos:</span>
                    <span>${(completedOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {completedOrderExtras.length > 0 && (
                    <div className="flex justify-between text-[#6B5A52]">
                      <span>Total Implementos / Chocolates:</span>
                      <span>+${completedOrderExtras.reduce((s, e) => s + e.price, 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#6B5A52]">
                    <span>Tarifa de Entrega (Colón):</span>
                    <span>{completedOrder.delivery_type === 'pickup' ? '$0.00 (Retiro en Local)' : `$${deliveryCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-[#241A23] pt-2 border-t border-[#EBE2DB]">
                    <span>TOTAL DEL PEDIDO:</span>
                    <span className="text-[#763D8B]">${completedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method & Receipt */}
                <div className="pt-3 border-t border-[#EBE2DB] flex flex-wrap items-center justify-between text-xs gap-2">
                  <div>
                    <span className="text-[10px] text-[#7A6B63] block uppercase font-medium">Método de Pago:</span>
                    <span className="font-semibold text-[#763D8B]">{completedOrder.payment_method}</span>
                    {receiptRef && (
                      <span className="text-[11px] text-[#55434F] block">Ref: #{receiptRef}</span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Registrado en Base de Datos
                  </span>
                </div>

                {/* Attached screenshot snapshot */}
                {receiptImage && (
                  <div className="pt-3 border-t border-[#EBE2DB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#2E2421] flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-[#763D8B]" />
                        Captura de Comprobante Adjunta
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyReceiptImage}
                        className="text-[10px] text-[#763D8B] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedImage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedImage ? '¡Copiado!' : 'Copiar Imagen'}</span>
                      </button>
                    </div>
                    <div className="max-h-48 rounded-lg overflow-hidden border border-[#E8DED7] bg-[#FAF8F5]">
                      <img src={receiptImage} alt="Comprobante de Pago" className="w-full h-full object-contain max-h-48" />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons for Receipt */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a
                  href={getWhatsAppSummaryUrl(completedOrder, completedOrderExtras, receiptRef, !!receiptImage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Recibo Completo por WhatsApp</span>
                </a>

                <button
                  onClick={handlePrintReceipt}
                  className="px-5 py-3 bg-white hover:bg-stone-50 text-[#423530] border border-[#D5C2B8] text-xs font-semibold uppercase tracking-wider rounded-full shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#763D8B]" />
                  <span>Imprimir Recibo</span>
                </button>

                <button
                  onClick={handleCopyReceiptText}
                  className="px-5 py-3 bg-[#FAF8F5] hover:bg-[#EFE8E2] text-[#423530] border border-[#D5C2B8] text-xs font-semibold uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-[#763D8B]" />
                  <span>{copiedReceipt ? '¡Copiado!' : 'Copiar Texto'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-[#763D8B] hover:bg-[#602F72] text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs flex items-center gap-2.5 shadow-2xs">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span className="font-medium leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {/* Order Items Snapshot */}
              <div className="p-4 bg-white rounded-xl border border-[#EDE5DF] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B5A52] flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-[#763D8B]" />
                    <span>Resumen de Compra ({items.length} artículos)</span>
                  </h4>
                  {hasReservationItems ? (
                    <span className="text-[10px] font-semibold text-[#763D8B] bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      <span>Requiere Reserva (Mín. {maxPrepDays}d)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                      <span>Listo Para Ya (Hoy mismo)</span>
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 divide-y divide-[#F5EFEB]">
                  {items.map((it) => {
                    const isReady = isProductReadyNow(it.product);
                    return (
                      <div key={it.product_id} className="pt-2 flex justify-between items-start text-xs text-[#423530]">
                        <div className="min-w-0 pr-2">
                          <span className="font-medium text-[#241A23] block truncate">
                            {it.quantity}x {it.product_name}
                          </span>
                          <span className="inline-block mt-0.5 text-[9px]">
                            {isReady ? (
                              <span className="text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-semibold">
                                ⚡ Para Ya (Tal cual en foto)
                              </span>
                            ) : (
                              <span className="text-[#763D8B] bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded font-semibold">
                                📅 Por Reserva (Personalizable)
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="font-semibold text-[#241A23] shrink-0">${it.total_price.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-[#F2ECE6] flex justify-between text-xs font-semibold text-[#2E2421]">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* 1. Customer Contact */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B5A52]">
                  1. Datos del Cliente
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#423530] block mb-1 font-medium">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Sofía Valdés"
                      className="w-full text-base sm:text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#241A23] focus:border-[#763D8B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#423530] block mb-1 font-medium">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej. +507 6000-0000"
                      className="w-full text-base sm:text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#241A23] focus:border-[#763D8B] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-[#423530] block mb-1 font-medium">Correo Electrónico (Opcional)</label>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full text-base sm:text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#241A23] focus:border-[#763D8B] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Delivery & Colón Province Distritos/Corregimientos */}
              <div className="space-y-4 pt-2 border-t border-[#EBE2DB]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B5A52]">
                    2. Modalidad de Entrega (Exclusivo Provincia de Colón)
                  </h4>
                  <span className="text-[10px] font-semibold text-[#763D8B] bg-[#763D8B]/10 px-2 py-0.5 rounded-full">
                    Provincia de Colón
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      deliveryType === 'delivery'
                        ? 'border-[#763D8B] bg-[#763D8B]/5 ring-1 ring-[#763D8B]'
                        : 'border-[#D5C2B8] bg-white'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-[#763D8B] shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-[#241A23] block">Envío a Domicilio</span>
                      <span className="text-[10px] text-[#763D8B] font-medium">Según corregimiento</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      deliveryType === 'pickup'
                        ? 'border-[#763D8B] bg-[#763D8B]/5 ring-1 ring-[#763D8B]'
                        : 'border-[#D5C2B8] bg-white'
                    }`}
                  >
                    <Store className="w-5 h-5 text-[#763D8B] shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-[#241A23] block">Retiro en Local</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">$0.00 (Gratis)</span>
                    </div>
                  </button>
                </div>

                {/* Clear Date Notice Banner */}
                {hasReservationItems ? (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#763D8B]">
                      <CalendarDays className="w-4 h-4 shrink-0" />
                      <span>📅 Pedido con Productos Por Reserva (Confección artesanal)</span>
                    </div>
                    <p className="text-[11px] text-[#423530] font-light leading-relaxed">
                      Este pedido requiere un mínimo de <strong>{maxPrepDays} días de anticipación</strong> para la elaboración de tus arreglos.
                      La fecha más próxima de entrega disponible es el <strong>{formatSpanishDate(minDate)}</strong> ({minDate}).
                    </p>
                    <p className="text-[10px] text-[#763D8B] font-semibold">
                      ✨ Puedes elegir esa fecha o cualquier día posterior que prefieras para tu entrega o retiro.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                      <Zap className="w-4 h-4 text-amber-600 fill-amber-600 shrink-0" />
                      <span>⚡ Pedido Para Ya (Hecho en boutique)</span>
                    </div>
                    <p className="text-[11px] text-[#423530] font-light leading-relaxed">
                      Tus creaciones ya están hechas tal cual como en la foto. <strong>¡Puedes recibirlas hoy mismo en Colón</strong> o seleccionar la fecha de tu preferencia!
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#423530] block mb-1 font-semibold flex items-center justify-between">
                      <span>Fecha Deseada *</span>
                      <span className="text-[10px] font-normal text-stone-500">
                        {hasReservationItems ? `Mínimo: ${minDate}` : 'Desde hoy mismo'}
                      </span>
                    </label>
                    <input
                      type="date"
                      required
                      min={minDate}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#241A23] focus:border-[#763D8B] focus:outline-none font-medium"
                    />
                  </div>

                  {deliveryType === 'pickup' ? (
                    <div className="p-3 bg-white rounded-lg border border-[#D5C2B8] text-xs space-y-1">
                      <span className="font-semibold text-[#2E2421] block">Punto de Retiro:</span>
                      <p className="text-[11px] text-[#6E5A69]">
                        Boutique Ballonsdei · Calle 11 y Ave. Central, Ciudad de Colón.
                      </p>
                      <span className="text-[10px] text-emerald-700 font-medium">Sin costo adicional ($0.00)</span>
                    </div>
                  ) : null}
                </div>

                {/* Colón Districts & Corregimientos Selectors */}
                {deliveryType === 'delivery' && (
                  <div className="p-4 bg-white rounded-xl border border-[#EDE5DF] space-y-3.5 animate-fade-in">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#241A23]">
                      <MapPin className="w-4 h-4 text-[#763D8B]" />
                      <span>Selecciona tu Distrito y Corregimiento en Colón:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[#55434F] block mb-1 font-medium">Distrito *</label>
                        <select
                          value={districtId}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8] text-[#241A23] focus:border-[#763D8B] focus:outline-none"
                        >
                          {COLON_DISTRICTS.map((dist) => (
                            <option key={dist.id} value={dist.id}>
                              {dist.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-[#55434F] block mb-1 font-medium">Corregimiento & Tarifa *</label>
                        <select
                          value={corregimientoName}
                          onChange={(e) => setCorregimientoName(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8] text-[#241A23] focus:border-[#763D8B] focus:outline-none font-medium"
                        >
                          {currentDistrict.corregimientos.map((correg) => (
                            <option key={correg.name} value={correg.name}>
                              {correg.name} — ${correg.price.toFixed(2)} ({correg.estimatedTime || 'Entrega segura'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] text-[#55434F] block mb-1 font-medium">
                          Dirección Exacta en {corregimientoName} *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressDetails}
                          onChange={(e) => setAddressDetails(e.target.value)}
                          placeholder="Calle, número de casa/edificio, barriada o puntos de referencia"
                          className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#241A23] focus:border-[#763D8B] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-[#FAF4F7] p-2.5 rounded-lg border border-[#E8D9E3]">
                      <span className="text-[#6B5A52]">Costo de delivery para {corregimientoName}:</span>
                      <span className="font-bold text-[#763D8B]">${deliveryCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Chocolates, Extras & Cambios al Arreglo */}
              <div className="space-y-4 pt-2 border-t border-[#EBE2DB]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B5A52] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>3. ¿Deseas agregar Chocolates o Complementos?</span>
                  </h4>
                  <span className="text-[10px] text-[#7A6B63] italic">Opcional</span>
                </div>

                <p className="text-xs text-[#7A6B63] font-light">
                  Personaliza aún más tu sorpresa con chocolates finos, peluches o detalles especiales:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableExtras.map((extra) => {
                    const isSelected = selectedExtras.some((e) => e.id === extra.id);
                    return (
                      <div
                        key={extra.id}
                        onClick={() => toggleExtra(extra)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2.5 ${
                          isSelected
                            ? 'border-[#763D8B] bg-[#763D8B]/8 shadow-2xs ring-1 ring-[#763D8B]'
                            : 'border-[#EDE5DF] bg-white hover:border-[#D5C2B8]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-[#241A23] block">
                            {extra.name}
                          </span>
                          <span className="text-[10px] text-[#7A6B63] line-clamp-1 block">
                            {extra.description}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-[#763D8B] block">
                            +${extra.price.toFixed(2)}
                          </span>
                          <span className={`text-[10px] font-semibold uppercase ${isSelected ? 'text-emerald-700' : 'text-[#8A796F]'}`}>
                            {isSelected ? '✓ Agregado' : '+ Agregar'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cambios al Arreglo */}
                <div className="pt-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[#423530] block">
                    ¿Deseas cambiar algo del arreglo o colores?
                  </label>
                  <textarea
                    rows={2}
                    value={arrangementChanges}
                    onChange={(e) => setArrangementChanges(e.target.value)}
                    placeholder="Ej. Quisiera cambiar las rosas a color rosado pastel, o añadir una frase específica en el globo..."
                    className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#241A23] focus:border-[#763D8B] focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Payment Method with Yappy, Transferencia Bancaria, and Tarjeta */}
              <div className="space-y-4 pt-2 border-t border-[#EBE2DB]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B5A52]">
                  4. Método de Pago (Yappy, Transferencia Bancaria o Tarjeta)
                </h4>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Yappy')}
                    className={`p-2.5 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                      paymentMethod === 'Yappy'
                        ? 'border-[#763D8B] bg-[#763D8B] text-white shadow-xs'
                        : 'border-[#D5C2B8] bg-white text-[#423530] hover:bg-[#F2ECE6]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span>Yappy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Transferencia')}
                    className={`p-2.5 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                      paymentMethod === 'Transferencia'
                        ? 'border-[#763D8B] bg-[#763D8B] text-white shadow-xs'
                        : 'border-[#D5C2B8] bg-white text-[#423530] hover:bg-[#F2ECE6]'
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">ACH Banco</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Tarjeta')}
                    className={`p-2.5 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                      paymentMethod === 'Tarjeta'
                        ? 'border-[#763D8B] bg-[#763D8B] text-white shadow-xs'
                        : 'border-[#D5C2B8] bg-white text-[#423530] hover:bg-[#F2ECE6]'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 shrink-0" />
                    <span>Tarjeta</span>
                  </button>
                </div>

                {/* YAPPY PAYMENT BOX */}
                {paymentMethod === 'Yappy' && (
                  <div className="p-4 bg-gradient-to-br from-[#FAF5F7] to-[#F5EFF3] rounded-xl border border-[#E2D2DC] space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8D9E3]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#763D8B] text-white text-[11px] font-bold rounded-sm uppercase tracking-wide">
                          Yappy
                        </span>
                        <span className="text-xs font-semibold text-[#2E2421]">
                          Pagar a: {settings.store_name || 'Ballonsdei'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#763D8B]">
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-xs text-[#52404E] space-y-1">
                      <p>
                        <strong>1.</strong> Envía <strong>${grandTotal.toFixed(2)}</strong> por Yappy al número:{' '}
                        <strong className="text-[#2E2421] bg-white px-2 py-0.5 rounded border border-[#E0D3DB]">
                          {settings.whatsapp_number || settings.phone || '+507 6432-4750'}
                        </strong>
                      </p>
                      <p>
                        <strong>2.</strong> <span className="text-rose-700 font-bold">Obligatorio:</span> Toma una captura del comprobante y súbela aquí abajo para continuar:
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className={`flex-1 border-2 border-dashed ${!receiptImage ? 'border-[#763D8B] bg-purple-50/40 ring-1 ring-[#763D8B]/20' : 'border-[#CBB8C5] bg-white'} hover:border-[#763D8B] p-3.5 rounded-xl text-center cursor-pointer transition-colors group block`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptUpload}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-2 text-xs text-[#763D8B] group-hover:text-[#58256B]">
                          <Upload className="w-4 h-4 shrink-0" />
                          <span className="font-bold">
                            {receiptImage ? 'Cambiar captura de Yappy' : 'Subir captura de comprobante de Yappy (Requerido) *'}
                          </span>
                        </div>
                      </label>

                      {receiptImage && (
                        <div className="p-2.5 bg-white rounded-lg border border-emerald-300 flex items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-12 h-12 rounded bg-[#FAF8F5] overflow-hidden border border-[#E8DED7] shrink-0">
                              <img src={receiptImage} alt="Comprobante" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Comprobante Yappy cargado con éxito
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReceiptImage(null)}
                            className="text-xs text-rose-600 hover:text-rose-800 p-1 font-medium cursor-pointer"
                          >
                            Quitar
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="text-[11px] font-medium text-[#423530] block mb-1">
                          N° de Confirmación o Referencia Yappy (Opcional)
                        </label>
                        <input
                          type="text"
                          value={receiptRef}
                          onChange={(e) => setReceiptRef(e.target.value)}
                          placeholder="Ej. #948271"
                          className="w-full text-xs p-2 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421] focus:border-[#763D8B] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TRANSFERENCIA BANCARIA PAYMENT BOX */}
                {paymentMethod === 'Transferencia' && (
                  <div className="p-4 bg-gradient-to-br from-[#F5F8FA] to-[#EBF2F5] rounded-xl border border-[#CDE0E8] space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-[#BED6E0]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#1B5E7C] text-white text-[11px] font-bold rounded-sm uppercase tracking-wide">
                          Transferencia ACH
                        </span>
                        <span className="text-xs font-semibold text-[#2E2421]">
                          Banco General
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#1B5E7C]">
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Bank Coordinates */}
                    <div className="text-xs text-[#2A4854] space-y-1.5 bg-white p-3 rounded-lg border border-[#BED6E0]">
                      <div className="flex justify-between">
                        <span className="text-[#648492]">Banco:</span>
                        <strong className="text-[#1A3744]">Banco General (Panamá)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#648492]">Tipo de Cuenta:</span>
                        <strong className="text-[#1A3744]">Cuenta de Ahorros</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#648492]">Titular:</span>
                        <strong className="text-[#1A3744]">Ballonsdei</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#648492]">N° de Cuenta:</span>
                        <strong className="text-[#1B5E7C] font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          04-72-99-847291-3
                        </strong>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-[#E8EFF2]">
                        <span className="text-[#648492]">Monto exacto:</span>
                        <strong className="text-emerald-700 text-sm">${grandTotal.toFixed(2)}</strong>
                      </div>
                    </div>

                    <p className="text-xs text-[#2A4854]">
                      <span className="text-rose-700 font-bold">Obligatorio:</span> Transfiere el total y sube la captura de pantalla de la transferencia ACH para continuar:
                    </p>

                    <div className="space-y-2 pt-1">
                      <label className={`flex-1 border-2 border-dashed ${!receiptImage ? 'border-[#1B5E7C] bg-blue-50/50 ring-1 ring-[#1B5E7C]/20' : 'border-[#CBB8C5] bg-white'} hover:border-[#1B5E7C] p-3.5 rounded-xl text-center cursor-pointer transition-colors group block`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptUpload}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-2 text-xs text-[#1B5E7C] group-hover:text-[#124257]">
                          <Upload className="w-4 h-4 shrink-0" />
                          <span className="font-bold">
                            {receiptImage ? 'Cambiar captura de Transferencia' : 'Subir captura de comprobante bancario (Requerido) *'}
                          </span>
                        </div>
                      </label>

                      {receiptImage && (
                        <div className="p-2.5 bg-white rounded-lg border border-emerald-300 flex items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-12 h-12 rounded bg-[#FAF8F5] overflow-hidden border border-[#E8DED7] shrink-0">
                              <img src={receiptImage} alt="Comprobante" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Comprobante de transferencia cargado con éxito
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReceiptImage(null)}
                            className="text-xs text-rose-600 hover:text-rose-800 p-1 font-medium cursor-pointer"
                          >
                            Quitar
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="text-[11px] font-medium text-[#423530] block mb-1">
                          N° de Confirmación ACH o Referencia de Banco (Opcional)
                        </label>
                        <input
                          type="text"
                          value={receiptRef}
                          onChange={(e) => setReceiptRef(e.target.value)}
                          placeholder="Ej. #ACH-89240"
                          className="w-full text-xs p-2 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421] focus:border-[#1B5E7C] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dedication or notes */}
              <div className="space-y-2 pt-2 border-t border-[#EBE2DB]">
                <label className="text-xs font-medium text-[#423530] block">
                  Dedicatoria para Tarjeta de Regalo:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mensaje emotivo que irá escrito en la tarjeta de regalo..."
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#241A23] focus:border-[#763D8B] focus:outline-none"
                />
              </div>

              {/* Summary and grand total */}
              <div className="p-4 bg-[#FAF4F7] rounded-xl border border-[#E8D9E3] space-y-2">
                <div className="flex justify-between text-xs text-[#6B5A52]">
                  <span>Subtotal productos:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {extrasTotal > 0 && (
                  <div className="flex justify-between text-xs text-[#6B5A52]">
                    <span>Chocolates & Extras ({selectedExtras.length}):</span>
                    <span>+${extrasTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-[#6B5A52]">
                  <span>{deliveryType === 'delivery' ? `Delivery (${corregimientoName}, Colón):` : 'Retiro en Local (Colón Centro):'}</span>
                  <span className={deliveryType === 'pickup' ? 'text-emerald-700 font-semibold' : ''}>
                    {deliveryType === 'pickup' ? '$0.00 (Gratis)' : `$${deliveryCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#241A23] pt-2 border-t border-[#E8D9E3]">
                  <span>Total a Pagar:</span>
                  <span className="text-[#763D8B]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submission Notice if receipt image is missing */}
              {(paymentMethod === 'Yappy' || paymentMethod === 'Transferencia') && !receiptImage && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Para confirmar tu pedido debes adjuntar la captura del pago arriba.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || ((paymentMethod === 'Yappy' || paymentMethod === 'Transferencia') && !receiptImage)}
                className="btn-cta-emil w-full py-4 bg-[#763D8B] hover:bg-[#602F72] disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-full shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
              >
                {isSubmitting ? (
                  <span>Guardando Pedido en Supabase...</span>
                ) : (
                  <>
                    <span>Confirmar Pedido</span>
                    <span>(${grandTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
