// Property Models
export interface Property {
  id: string;
  title: string;
  project: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  currency: Currency;
  size: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  description?: string;
  images?: string[];
  amenities?: string[];
  features?: string[];
  latitude?: number;
  longitude?: number;
  viewCount: number;
  inquiries: number;
  tours: number;
  offers: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum PropertyType {
  Apartment = 'Apartment',
  Villa = 'Villa',
  Penthouse = 'Penthouse',
  Townhouse = 'Townhouse',
  Studio = 'Studio',
  Loft = 'Loft',
  Duplex = 'Duplex'
}

export enum PropertyStatus {
  Available = 'Available',
  Reserved = 'Reserved',
  Sold = 'Sold',
  OffMarket = 'OffMarket'
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  AED = 'AED',
  CAD = 'CAD',
  AUD = 'AUD',
  SGD = 'SGD',
  JPY = 'JPY'
}

export interface PropertyFilterOptions {
  searchTerm?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  minPrice?: number;
  maxPrice?: number;
  currency?: Currency;
  minSize?: number;
  maxSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  project?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PropertyListResponse {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreatePropertyRequest {
  title: string;
  project: string;
  type: string;
  price: number;
  currency: string;
  size: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  description?: string;
  images?: string;
  amenities?: string;
  features?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdatePropertyRequest {
  title?: string;
  project?: string;
  type?: string;
  price?: number;
  currency?: string;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  description?: string;
  images?: string;
  amenities?: string;
  features?: string;
  latitude?: number;
  longitude?: number;
}

export interface TopPropertyDto {
  id: string;
  title: string;
  price: number;
  currency: Currency;
  viewCount: number;
  status: PropertyStatus;
  projectName: string;
}

export interface PropertyRecommendationDto {
  propertyId: string;
  property: Property;
  confidenceScore: number;
  recommendationReason: string;
  matchScore: number;
  priceMatchScore: number;
  locationMatchScore: number;
  featuresMatchScore: number;
  generatedAt: Date;
}