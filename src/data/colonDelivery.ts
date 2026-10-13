export interface CorregimientoDelivery {
  name: string;
  price: number;
  estimatedTime?: string;
}

export interface DistritoDelivery {
  id: string;
  name: string;
  corregimientos: CorregimientoDelivery[];
}

export interface OrderExtraItem {
  id: string;
  name: string;
  category: 'chocolate' | 'peluche' | 'globo' | 'accesorio';
  price: number;
  description: string;
}

export const COLON_DISTRICTS: DistritoDelivery[] = [
  {
    id: 'distrito-colon',
    name: 'Distrito de Colón (Cabecera)',
    corregimientos: [
      { name: 'Barrio Norte', price: 3.50, estimatedTime: 'Mismo día / 1-2 hrs' },
      { name: 'Barrio Sur', price: 3.50, estimatedTime: 'Mismo día / 1-2 hrs' },
      { name: 'Cristóbal (San José, Arco Iris, Margarita)', price: 4.00, estimatedTime: 'Mismo día / 1-2 hrs' },
      { name: 'Cristóbal Este', price: 4.50, estimatedTime: 'Mismo día / 2-3 hrs' },
      { name: 'Cativá', price: 4.50, estimatedTime: 'Mismo día / 2-3 hrs' },
      { name: 'Sabanitas', price: 5.00, estimatedTime: 'Mismo día / 2-3 hrs' },
      { name: 'Puerto Pilón', price: 5.50, estimatedTime: 'Mismo día / 2-3 hrs' },
      { name: 'Nueva Providencia', price: 6.00, estimatedTime: 'Mismo día / 2-4 hrs' },
      { name: 'Limón', price: 6.50, estimatedTime: 'Mismo día / 2-4 hrs' },
      { name: 'Buena Vista', price: 7.00, estimatedTime: 'Mismo día / 3-4 hrs' },
      { name: 'Salamanca', price: 8.00, estimatedTime: 'Mismo día / 3-5 hrs' },
      { name: 'San Juan', price: 8.50, estimatedTime: 'Mismo día / 3-5 hrs' },
      { name: 'Santa Rosa', price: 9.00, estimatedTime: 'Mismo día / 4-5 hrs' },
      { name: 'Ciricito', price: 10.00, estimatedTime: 'Programado / 24 hrs' },
      { name: 'Escobal', price: 10.00, estimatedTime: 'Programado / 24 hrs' },
    ],
  },
  {
    id: 'distrito-portobelo',
    name: 'Distrito de Portobelo',
    corregimientos: [
      { name: 'María Chiquita', price: 9.00, estimatedTime: 'Mismo día / Programado' },
      { name: 'Portobelo (Cabecera Histórica)', price: 12.00, estimatedTime: 'Programado / 24 hrs' },
      { name: 'Garrote', price: 13.00, estimatedTime: 'Programado / 24 hrs' },
      { name: 'Cacique', price: 14.00, estimatedTime: 'Programado / 24 hrs' },
      { name: 'Isla Grande (Muelle La Guaira)', price: 15.00, estimatedTime: 'Programado / 24 hrs' },
    ],
  },
  {
    id: 'distrito-chagres',
    name: 'Distrito de Chagres',
    corregimientos: [
      { name: 'Achiote', price: 11.00, estimatedTime: 'Programado / 24 hrs' },
      { name: 'Nuevo Chagres', price: 12.00, estimatedTime: 'Programado / 24 hrs' },
      { name: 'Palmas Bellas', price: 12.00, estimatedTime: 'Programado / 24 hrs' },
      { name: 'Salud', price: 13.00, estimatedTime: 'Programado / 24 hrs' },
      { name: 'El Guabo', price: 13.00, estimatedTime: 'Programado / 24 hrs' },
      { name: 'La Encantada', price: 13.00, estimatedTime: 'Programado / 24 hrs' },
      { name: 'Piña', price: 14.00, estimatedTime: 'Programado / 24 hrs' },
    ],
  },
  {
    id: 'distrito-donoso',
    name: 'Distrito de Donoso',
    corregimientos: [
      { name: 'Miguel de la Borda', price: 15.00, estimatedTime: 'Programado / 24-48 hrs' },
      { name: 'Río Indio', price: 14.00, estimatedTime: 'Programado / 24-48 hrs' },
      { name: 'Gobea', price: 15.00, estimatedTime: 'Programado / 24-48 hrs' },
      { name: 'El Guácimo', price: 16.00, estimatedTime: 'Programado / 24-48 hrs' },
      { name: 'Coclé del Norte', price: 18.00, estimatedTime: 'Programado / 24-48 hrs' },
    ],
  },
  {
    id: 'distrito-santa-isabel',
    name: 'Distrito de Santa Isabel (Costa Arriba)',
    corregimientos: [
      { name: 'Nombre de Dios', price: 15.00, estimatedTime: 'Programado / 24-48 hrs' },
      { name: 'Palenque', price: 15.00, estimatedTime: 'Programado / 24-48 hrs' },
      { name: 'Cuango', price: 15.00, estimatedTime: 'Programado / 24-48 hrs' },
      { name: 'Miramar', price: 16.00, estimatedTime: 'Programado / 24-48 hrs' },
      { name: 'Palmira', price: 16.00, estimatedTime: 'Programado / 24-48 hrs' },
      { name: 'Playa Chiquita', price: 16.00, estimatedTime: 'Programado / 24-48 hrs' },
      { name: 'Viento Frío', price: 16.00, estimatedTime: 'Programado / 24-48 hrs' },
      { name: 'Santa Isabel', price: 17.00, estimatedTime: 'Programado / 24-48 hrs' },
    ],
  },
  {
    id: 'distrito-omar-torrijos',
    name: 'Distrito Omar Torrijos Herrera',
    corregimientos: [
      { name: 'San José del General', price: 14.00, estimatedTime: 'Programado / 24-48 hrs' },
      { name: 'San Juan de Turbe', price: 14.00, estimatedTime: 'Programado / 24-48 hrs' },
      { name: 'Nueva Esperanza', price: 14.00, estimatedTime: 'Programado / 24-48 hrs' },
    ],
  },
];

export const AVAILABLE_EXTRAS: OrderExtraItem[] = [
  {
    id: 'extra-ferrero-8',
    name: 'Caja de Bombones Ferrero Rocher (8 uds)',
    category: 'chocolate',
    price: 7.50,
    description: 'Chocolates crujientes con avellana entera y baño de cacao.',
  },
  {
    id: 'extra-ferrero-16',
    name: 'Caja de Bombones Ferrero Rocher (16 uds)',
    category: 'chocolate',
    price: 14.00,
    description: 'Presentación de lujo ideal para aniversarios y ocasiones especiales.',
  },
  {
    id: 'extra-lindt-chocolate',
    name: 'Barra de Chocolate Suizo Lindt Excellence',
    category: 'chocolate',
    price: 4.50,
    description: 'Chocolate suizo fino con leche o amargo 70%.',
  },
  {
    id: 'extra-bombones-surtidos',
    name: 'Caja de Bombones Belgas Surtidos',
    category: 'chocolate',
    price: 8.00,
    description: 'Selección de pralinés finos y trufas artesanales.',
  },
  {
    id: 'extra-peluche-oso',
    name: 'Peluche Mediano Suave Cariñoso',
    category: 'peluche',
    price: 10.00,
    description: 'Peluche hipoalergénico de alta suavidad para abrazar.',
  },
  {
    id: 'extra-topper-acrilico',
    name: 'Topper Acrílico Espejado ("Feliz Cumpleaños" / "Te Amo")',
    category: 'accesorio',
    price: 4.00,
    description: 'Letrero decorativo dorado o plateado para clavar en el arreglo.',
  },
  {
    id: 'extra-globo-helio',
    name: 'Globo Metálico Extra con Helio (18 pulgadas)',
    category: 'globo',
    price: 4.50,
    description: 'Globo foil flotante con temática a elección (Amor, Cumpleaños, Felicitaciones).',
  },
  {
    id: 'extra-luces-led',
    name: 'Luces Micro-LED Cálidas de Hadas con Baterías',
    category: 'accesorio',
    price: 3.50,
    description: 'Guirnalda de luz suave entrelazada entre las flores y globos.',
  },
];
