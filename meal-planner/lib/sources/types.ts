/** Bentuk data yang sudah dinormalkan, sebelum masuk basis data. */

export type NormalizedStore = {
  osmId: string; // "node/123456789"
  osmType: 'node' | 'way' | 'relation';
  name: string;
  brand?: string;
  shopType?: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  openingHours?: string;
  website?: string;
};

export type NormalizedPrice = {
  externalId: string; // "open-prices:12345"
  name: string;
  productCode?: string;
  price: number;
  currency: string;
  isDiscounted: boolean;
  packQuantity?: number;
  packUnitRaw?: string;
  observedAt: Date;
  osmId?: string; // toko tempat harga itu diamati
  sourceUrl?: string;
};

export type GeoCandidate = {
  label: string;
  latitude: number;
  longitude: number;
  type?: string;
  city?: string;
  country?: string;
};
