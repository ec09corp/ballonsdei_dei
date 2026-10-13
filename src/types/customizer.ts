export type CustomizerCategory = 
  | 'flores' 
  | 'globos' 
  | 'chocolates' 
  | 'peluches' 
  | 'decoracion' 
  | 'cintas' 
  | 'cajas' 
  | 'accesorios';

export interface CustomizerColor {
  name: string;
  hex: string;
}

export interface CustomizerElementItem {
  id: string;
  name: string;
  category: CustomizerCategory;
  price: number;
  image_url: string;
  available_colors?: CustomizerColor[];
  default_color?: string;
  active: boolean;
  order_index?: number;
  default_width?: number;
  default_height?: number;
  created_at?: string;
}

export interface CanvasPlacedElement {
  id: string;
  elementId: string;
  type: CustomizerCategory;
  name: string;
  image: string;
  x: number; // percentage (0 to 100) or pixels
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees 0-360
  color?: string; // hex
  price: number;
  zIndex: number;
}

export interface CanvasTextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  rotation: number;
  zIndex: number;
}

export interface ArrangementDesignData {
  productId?: string;
  productName?: string;
  elements: CanvasPlacedElement[];
  texts: CanvasTextElement[];
  referenceImage?: string;
  basePrice: number;
  customizationPrice: number;
  totalPrice: number;
  previewImage?: string;
  summaryText?: string;
}
