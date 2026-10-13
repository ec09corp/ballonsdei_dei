import React, { useState, useEffect } from 'react';
import { 
  CalendarRange, 
  Plus, 
  Calendar, 
  Phone, 
  User, 
  AlertTriangle, 
  Check, 
  X,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Rental, RentalStatus, Product } from '../../types/database';
import { rentalService } from '../../services/rentalService';

interface AdminRentalsProps {
  products: Product[];
}

export const AdminRentals: React.FC<AdminRentalsProps> = ({ products }) => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New rental modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [depositAmount, setDepositAmount] = useState(30);
  const [totalPrice, setTotalPrice] = useState(45);
  const [notes, setNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rentalToDelete, setRentalToDelete] = useState<{ id: string; clientName: string } | null>(null);

  const confirmDeleteRental = async () => {
    if (!rentalToDelete) return;
    const { id, clientName } = rentalToDelete;
    const ok = await rentalService.deleteRental(id);
    if (ok) {
      setSuccessMsg(`Reserva de ${clientName} eliminada.`);
      loadRentals();
    } else {
      setErrorMsg('No se pudo eliminar la reserva.');
    }
    setRentalToDelete(null);
  };

  const rentalProducts = products.filter((p) => p.available_for_rental);

  const loadRentals = async () => {
    setIsLoading(true);
    const data = await rentalService.getRentals();
    setRentals(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRentals();
  }, []);

  const openNewRentalModal = () => {
    const firstRental = rentalProducts[0];
    setSelectedProductId(firstRental?.id || '');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setStartDate('');
    setEndDate('');
    setQuantity(1);
    setDepositAmount(firstRental?.rental_deposit || 25);
    setTotalPrice(firstRental?.rental_price || 40);
    setNotes('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleProductSelect = (pId: string) => {
    setSelectedProductId(pId);
    const prod = rentalProducts.find((p) => p.id === pId);
    if (prod) {
      setDepositAmount(prod.rental_deposit || 25);
      setTotalPrice(prod.rental_price || 40);
    }
  };

  const handleCreateRental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !startDate || !endDate || !customerName || !customerPhone) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }

    setErrorMsg(null);
    const targetProd = rentalProducts.find((p) => p.id === selectedProductId);

    const { rental, error } = await rentalService.createRental({
      product_id: selectedProductId,
      product_name: targetProd?.name || 'Artículo Alquiler',
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      start_date: startDate,
      end_date: endDate,
      quantity,
      deposit_amount: depositAmount,
      total_price: totalPrice,
      notes,
    });

    if (error || !rental) {
      setErrorMsg(error?.message || 'No se pudo crear la reserva.');
      return;
    }

    setSuccessMsg('Reserva de alquiler registrada con éxito.');
    setIsModalOpen(false);
    loadRentals();
  };

  const handleStatusChange = async (rentalId: string, status: RentalStatus) => {
    await rentalService.updateRentalStatus(rentalId, status);
    setSuccessMsg('Estado de la reserva actualizado.');
    loadRentals();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2E2421]">
            Alquileres y Reservas de Mobiliario
          </h1>
          <p className="text-xs text-[#7A6B63] mt-1 font-light">
            Control de reservas de cilindros, aros dorados, mesas y sillas para eventos y quinceaños. Con prevención de choque de fechas.
          </p>
        </div>

        <button
          onClick={openNewRentalModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8D5844] hover:bg-[#744533] text-white rounded-lg text-xs font-medium uppercase tracking-wider shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Reserva</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Rentals Table */}
      <div className="bg-white rounded-2xl border border-[#EDE5DF] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#EBE2DB] bg-[#FAF8F5] flex items-center justify-between">
          <h3 className="font-serif text-base font-medium text-[#2E2421]">
            Reservas Registradas ({rentals.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#EBE2DB] text-[#7A6B63] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Artículo de Alquiler</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Período de Alquiler</th>
                <th className="py-3 px-4">Tarifa / Depósito</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Cambiar Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE6]">
              {rentals.map((r) => (
                <tr key={r.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-[#2E2421] block">{r.product_name}</span>
                    <span className="text-[10px] text-[#8A796F]">{r.quantity} unidad(es)</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[#2E2421]">{r.customer_name}</div>
                    <div className="text-[10px] text-[#8A796F]">{r.customer_phone}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#5C4D46]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#8D5844]" />
                      <span>{r.start_date} al {r.end_date}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#2E2421]">${r.total_price.toFixed(2)}</span>
                    <span className="text-[10px] text-[#8A796F] block">Depósito: ${r.deposit_amount.toFixed(2)}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.status === 'reserved'
                          ? 'bg-amber-100 text-amber-800'
                          : r.status === 'active'
                          ? 'bg-blue-100 text-blue-800'
                          : r.status === 'returned'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {r.status === 'reserved'
                        ? 'Reservado'
                        : r.status === 'active'
                        ? 'En Curso'
                        : r.status === 'returned'
                        ? 'Devuelto'
                        : 'Cancelado'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value as RentalStatus)}
                        className="p-1.5 rounded border border-[#D5C2B8] bg-white text-xs font-medium cursor-pointer"
                      >
                        <option value="reserved">Reservado</option>
                        <option value="active">Activo (En Evento)</option>
                        <option value="returned">Devuelto (Depósito Reintegrado)</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                      <button
                        onClick={() => setRentalToDelete({ id: r.id, clientName: r.customer_name })}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        title="Eliminar reserva"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Rental Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-hidden">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#EDE5DF] overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="p-4 sm:p-5 border-b border-[#EBE2DB] bg-[#FAF8F5] flex items-center justify-between shrink-0">
              <h3 className="font-serif text-lg font-medium text-[#2E2421]">
                Registrar Reserva de Alquiler
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#7A6B63] hover:text-[#2E2421] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRental} className="flex flex-col flex-1 overflow-hidden text-xs">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

              <div>
                <label className="text-xs font-medium text-[#423530] block mb-1">
                  Artículo de Alquiler *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                >
                  {rentalProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.rental_price}/día)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Fecha Inicio Evento *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Fecha Fin / Devolución *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Carmen Ortiz"
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+507 6000-0000"
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Tarifa Alquiler ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Depósito Garantía ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#423530] block mb-1">
                  Notas del Evento (Salón, hora de montaje, etc.)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#EBE2DB] bg-white flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-[#D5C2B8] rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#8D5844] hover:bg-[#744533] text-white rounded-lg font-medium cursor-pointer"
              >
                Guardar Reserva
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {rentalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-rose-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#2E2421]">
                ¿Eliminar reserva?
              </h3>
              <p className="text-xs text-[#7A6B63] mt-1 font-light">
                ¿Estás seguro de que deseas eliminar la reserva de <strong>{rentalToDelete.clientName}</strong>?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={confirmDeleteRental}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Eliminar
              </button>
              <button
                type="button"
                onClick={() => setRentalToDelete(null)}
                className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F2ECE6] text-[#423530] border border-[#D5C2B8] text-xs font-medium uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
