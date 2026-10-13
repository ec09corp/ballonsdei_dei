export interface ColonCorregimiento {
  name: string;
  price: number;
}

export interface ColonDistrict {
  district: string;
  corregimientos: ColonCorregimiento[];
}

export const COLON_DELIVERY_DISTRICTS: ColonDistrict[] = [
  {
    district: 'Colón (Cabecera)',
    corregimientos: [
      { name: 'Barrio Norte', price: 3.00 },
      { name: 'Barrio Sur', price: 3.00 },
      { name: 'Cristóbal', price: 4.00 },
      { name: 'Cristóbal Este', price: 4.00 },
      { name: 'Cativá', price: 4.50 },
      { name: 'Sabanitas', price: 5.00 },
      { name: 'Puerto Pilón', price: 5.50 },
      { name: 'Nueva Providencia', price: 6.00 },
      { name: 'Limón', price: 6.50 },
      { name: 'Buena Vista', price: 7.00 },
      { name: 'San Juan', price: 7.00 },
      { name: 'Santa Rosa', price: 7.50 },
      { name: 'Salamanca', price: 7.50 },
      { name: 'Escobal', price: 9.00 },
      { name: 'Ciricito', price: 10.00 },
    ],
  },
  {
    district: 'Portobelo (Costa Arriba)',
    corregimientos: [
      { name: 'María Chiquita', price: 7.50 },
      { name: 'Portobelo', price: 9.00 },
      { name: 'Cacique', price: 11.00 },
      { name: 'Puerto Lindo / Garrote', price: 12.00 },
      { name: 'Isla Grande', price: 14.00 },
    ],
  },
  {
    district: 'Chagres (Costa Abajo)',
    corregimientos: [
      { name: 'Nuevo Chagres', price: 9.00 },
      { name: 'Achiote', price: 10.00 },
      { name: 'Palmas Bellas', price: 10.00 },
      { name: 'Piña', price: 11.00 },
      { name: 'Salud', price: 11.00 },
      { name: 'El Guabo', price: 12.00 },
      { name: 'La Encantada', price: 12.00 },
    ],
  },
  {
    district: 'Santa Isabel (Costa Arriba Profunda)',
    corregimientos: [
      { name: 'Palenque', price: 12.00 },
      { name: 'Cuango', price: 13.00 },
      { name: 'Miramar', price: 13.00 },
      { name: 'Nombre de Dios', price: 14.00 },
      { name: 'Viento Frío', price: 14.00 },
      { name: 'Playa Chiquita', price: 14.00 },
      { name: 'Santa Isabel', price: 15.00 },
      { name: 'Palmira', price: 15.00 },
    ],
  },
  {
    district: 'Donoso (Costa Abajo Minera / Occidental)',
    corregimientos: [
      { name: 'Río Indio', price: 13.00 },
      { name: 'Miguel de la Borda', price: 14.00 },
      { name: 'Gobea', price: 14.00 },
      { name: 'El Guásimo', price: 15.00 },
      { name: 'Coclé del Norte', price: 16.00 },
    ],
  },
  {
    district: 'Especial Omar Torrijos Herrera',
    corregimientos: [
      { name: 'San José del General', price: 16.00 },
      { name: 'San Juan de Turbe', price: 16.00 },
      { name: 'Nueva Esperanza', price: 16.00 },
    ],
  },
];

export const RETIRO_EN_LOCAL = {
  name: 'Retiro en Boutique Ballonsdei (Ciudad de Colón)',
  price: 0.00,
  address: 'Boutique Ballonsdei, Ciudad de Colón',
  note: 'Sin costo adicional. Te avisamos por WhatsApp cuando tu pedido esté listo para retirar.',
};
