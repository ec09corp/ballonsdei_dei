import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { StoreSettings } from '../types/database';

// Términos y Condiciones + Política de Privacidad de BALLOONSDEI.
// Se abren con #terminos o #privacidad (pie de página y checkout).

type Vista = 'terminos' | 'privacidad' | null;

const ACTUALIZADO = '8 de noviembre de 2026';

function leerHash(): Vista {
  const h = window.location.hash.toLowerCase();
  if (h === '#terminos') return 'terminos';
  if (h === '#privacidad') return 'privacidad';
  return null;
}

export function abrirLegal(vista: 'terminos' | 'privacidad') {
  window.location.hash = vista;
}

const Seccion: React.FC<{ titulo: string; children: React.ReactNode }> = ({ titulo, children }) => (
  <section className="space-y-2">
    <h3 className="font-serif text-lg text-[#241A23]">{titulo}</h3>
    <div className="space-y-2 text-sm leading-relaxed text-[#4A3C46]">{children}</div>
  </section>
);

export const LegalModal: React.FC<{ settings: StoreSettings }> = ({ settings }) => {
  const [vista, setVista] = useState<Vista>(() => leerHash());

  useEffect(() => {
    const alCambiar = () => setVista(leerHash());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  useEffect(() => {
    if (!vista) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [vista]);

  if (!vista) return null;

  const nombre = settings.store_name || 'BALLOONSDEI';
  const whatsapp = settings.whatsapp_number || settings.phone || '+507 6432-4750';

  function cerrar() {
    history.replaceState(null, '', window.location.pathname + window.location.search);
    setVista(null);
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-titulo"
      onClick={cerrar}
    >
      <div
        className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-[#FBF8F5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#EADFE6] bg-white px-5 py-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => abrirLegal('terminos')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${vista === 'terminos' ? 'bg-[#763D8B] text-white' : 'text-[#763D8B] hover:bg-[#F3E9F0]'}`}
            >
              Términos y Condiciones
            </button>
            <button
              type="button"
              onClick={() => abrirLegal('privacidad')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${vista === 'privacidad' ? 'bg-[#763D8B] text-white' : 'text-[#763D8B] hover:bg-[#F3E9F0]'}`}
            >
              Privacidad
            </button>
          </div>
          <button type="button" onClick={cerrar} aria-label="Cerrar" className="rounded-full p-2 text-[#6E5A69] hover:bg-[#F3E9F0]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-5 py-6 sm:px-8">
          {vista === 'terminos' ? (
            <>
              <div>
                <h2 id="legal-titulo" className="font-serif text-2xl text-[#241A23]">Términos y Condiciones</h2>
                <p className="mt-1 text-xs text-[#7A6B75]">Última actualización: {ACTUALIZADO}</p>
              </div>

              <div className="rounded-xl border border-[#E7C9C9] bg-[#FDF2F2] p-4 text-sm text-[#7A2E2E]">
                <strong>Importante:</strong> {nombre} <strong>no acepta cambios ni devoluciones</strong>. Revisa bien tu
                pedido antes de pagar. Solo hay solución si el producto llega dañado o con defecto, o si se agotó
                (ver puntos 6 y 7).
              </div>

              <Seccion titulo="1. Quiénes somos">
                <p>
                  {nombre} es una tienda de arreglos florales, globos, ositos, desayunos sorpresa y decoración de
                  eventos en la provincia de Colón, Panamá. Puedes escribirnos por WhatsApp al <strong>{whatsapp}</strong>.
                  Al hacer un pedido en esta página aceptas estos términos.
                </p>
              </Seccion>

              <Seccion titulo="2. Productos y fotos">
                <p>
                  Los productos “Para Ya” se entregan tal como se ven en la foto. Las flores y algunos materiales son
                  naturales o artesanales: el color, el tamaño o la forma pueden variar un poco. Si un insumo no está
                  disponible, lo cambiamos por otro igual o de mayor valor, sin costo extra para ti.
                </p>
                <p>Los productos “Por Reserva” necesitan los días de anticipación que indica la página.</p>
              </Seccion>

              <Seccion titulo="3. Precios y pagos">
                <p>
                  Los precios están en dólares (USD). Aceptamos Yappy, transferencia bancaria (Banco General,
                  Banistmo y BAC), y MoneyGram o Western Union (recargo de $5.00).
                  Si transfieres desde otro banco distinto, la transferencia debe ser express. Para Yappy o
                  transferencia debes adjuntar la captura del pago. El pedido se confirma cuando verificamos el pago;
                  si hay un error en el precio, te avisamos antes de prepararlo.
                </p>
                <p>
                  <strong>No realizamos ningún trabajo sin abono.</strong> Puedes abonar y cancelar el resto hasta 1 día
                  antes de la entrega. Si tu pedido es para ya, debes pagarlo completo. El costo del delivery es
                  adicional al pago de los productos. <strong>Si abonas y desistes, no hay devoluciones.</strong>
                </p>
                <p>
                  Por seguridad no recibimos pagos en efectivo en el lugar de la entrega: todos los pagos se hacen por
                  transferencia, Yappy o ACH. El efectivo solo se recibe en la tienda física (Colón, entre calle 12 y 13,
                  Avenida Amador Guerrero). No nos hacemos responsables por billetes rotos.
                </p>
              </Seccion>

              <Seccion titulo="4. Confirmación del pedido">
                <p>
                  Al enviar el pedido recibes un número de pedido y un recibo para mandar por WhatsApp. Ese mensaje es
                  nuestra confirmación de que recibimos tu pedido. Lo preparamos cuando confirmamos el pago.
                </p>
              </Seccion>

              <Seccion titulo="5. Entrega y retiro">
                <p>
                  Entregamos dentro de la provincia de Colón. El costo de envío depende del corregimiento y se muestra
                  antes de pagar. También puedes retirar en nuestro local sin costo. Debe haber alguien para recibir el
                  pedido en la dirección y fecha indicadas; si no hay nadie, coordinamos una nueva entrega y el nuevo
                  envío puede tener costo.
                </p>
              </Seccion>

              <Seccion titulo="6. No hay cambios ni devoluciones">
                <p>
                  Por ser productos perecederos, hechos a mano o preparados para una fecha específica,{' '}
                  <strong>no aceptamos cambios ni devoluciones</strong> por gusto, arrepentimiento, error al elegir o
                  cambio de planes. <strong>Un pedido pagado no se puede cancelar.</strong>
                </p>
                <p>
                  Única excepción (garantía que exige la Ley 45 de 2007): si el producto llega <strong>dañado o con
                  defecto</strong>, escríbenos por WhatsApp el mismo día de la entrega con fotos. Lo revisamos y lo
                  reponemos o reparamos; si no es posible, te devolvemos el dinero por el mismo medio de pago.
                </p>
              </Seccion>

              <Seccion titulo="7. Producto agotado">
                <p>
                  Si después de pagar un producto se agota, te avisamos y eliges: cambiarlo por otro de igual precio o
                  recibir la devolución de tu dinero por el mismo medio de pago.
                </p>
              </Seccion>

              <Seccion titulo="8. Alquiler de mobiliario">
                <p>
                  Los alquileres se reservan por fecha. El depósito de garantía se devuelve cuando recibimos el
                  mobiliario completo y en buen estado. Si hay daños o faltantes, el costo se descuenta del depósito.
                </p>
              </Seccion>

              <Seccion titulo="9. Cambios a estos términos">
                <p>
                  Podemos actualizar estos términos. Cada pedido se rige por los términos publicados el día en que se
                  hizo. Ante cualquier duda, escríbenos al {whatsapp}.
                </p>
              </Seccion>
            </>
          ) : (
            <>
              <div>
                <h2 id="legal-titulo" className="font-serif text-2xl text-[#241A23]">Política de Privacidad</h2>
                <p className="mt-1 text-xs text-[#7A6B75]">Última actualización: {ACTUALIZADO}</p>
              </div>

              <Seccion titulo="1. Responsable">
                <p>
                  {nombre}, provincia de Colón, Panamá, es responsable de tus datos personales según la Ley 81 de 2019
                  sobre Protección de Datos Personales. Contacto: WhatsApp {whatsapp}.
                </p>
              </Seccion>

              <Seccion titulo="2. Qué datos recogemos">
                <p>
                  Nombre, teléfono o WhatsApp, correo (opcional), dirección y fecha de entrega, dedicatoria y los
                  productos de tu pedido. La captura del comprobante de pago la envías tú por WhatsApp; esta página no
                  la guarda.
                </p>
              </Seccion>

              <Seccion titulo="3. Para qué los usamos">
                <p>
                  Solo para preparar, cobrar y entregar tu pedido, comunicarnos contigo sobre él y cumplir obligaciones
                  legales. No te enviaremos publicidad sin tu permiso.
                </p>
              </Seccion>

              <Seccion titulo="4. Con quién se comparten">
                <p>
                  No vendemos tus datos. Se guardan en servicios de alojamiento y base de datos (Supabase y Vercel) y,
                  cuando nos escribes, en WhatsApp. Si pides envío, compartimos con el repartidor solo lo necesario para
                  entregar (nombre, teléfono y dirección).
                </p>
              </Seccion>

              <Seccion titulo="5. Cuánto tiempo los guardamos">
                <p>Mientras sea necesario para atender tu pedido y por el tiempo que exija la ley.</p>
              </Seccion>

              <Seccion titulo="6. Tus derechos">
                <p>
                  Puedes pedir acceso, corrección, cancelación u oposición al uso de tus datos, y su portabilidad,
                  escribiéndonos al {whatsapp}. Si no quedas conforme, puedes acudir a la Autoridad Nacional de
                  Transparencia y Acceso a la Información (ANTAI).
                </p>
              </Seccion>

              <Seccion titulo="7. Seguridad">
                <p>
                  Los pedidos solo los puede ver el personal autorizado de la tienda con usuario y contraseña. Tomamos
                  medidas razonables para proteger tus datos.
                </p>
              </Seccion>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
