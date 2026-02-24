/**
 * Eywa MCP Types
 * Core data structures for the hotel booking protocol
 */

// ============================================
// Search Types
// ============================================

export interface SearchParams {
  destination: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  guests: number;
  rooms?: number;
  currency?: string;
  filters?: SearchFilters;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'distance';
  limit?: number;
  offset?: number;
}

export interface SearchFilters {
  priceMin?: number;
  priceMax?: number;
  starRating?: number[];
  amenities?: string[];
  propertyType?: PropertyType[];
  guestRatingMin?: number;
  distanceKm?: number;
  distanceFrom?: Coordinates;
  refundableOnly?: boolean;
  payAtHotel?: boolean;
}

export interface SearchResult {
  status: 'success' | 'error';
  searchId: string;
  destination: string;
  dates: DateRange;
  totalResults: number;
  results: PropertySummary[];
  facets?: SearchFacets;
}

export interface SearchFacets {
  priceRange: { min: number; max: number };
  starRatings: Record<string, number>;
  amenities: Record<string, number>;
}

// ============================================
// Property Types
// ============================================

export interface PropertySummary {
  propertyId: string;
  name: string;
  starRating: number;
  guestRating: number;
  guestReviewsCount: number;
  address: Address;
  images: {
    thumbnail: string;
    gallery: string[];
  };
  amenities: string[];
  priceSummary: PriceSummary;
  roomPreview: RoomPreview;
  badges: string[];
  availabilityStatus: 'available' | 'limited' | 'unavailable';
}

export interface Property {
  propertyId: string;
  name: string;
  starRating: number;
  guestRating: number;
  guestReviewsCount: number;
  description: string;
  address: Address;
  checkInTime: string;
  checkOutTime: string;
  images: string[];
  amenities: string[];
  policies: PropertyPolicies;
  contact: {
    phone?: string;
    email?: string;
  };
}

export interface PropertyPolicies {
  children?: string;
  pets?: string;
  smoking?: string;
  cancellation?: string;
}

export type PropertyType =
  | 'hotel'
  | 'resort'
  | 'boutique'
  | 'motel'
  | 'hostel'
  | 'apartment'
  | 'villa'
  | 'guesthouse'
  | 'bed_and_breakfast'
  | 'ryokan'
  | 'riad'
  | 'lodge'
  | 'cabin'
  | 'glamping';

// ============================================
// Room & Rate Types
// ============================================

export interface RoomPreview {
  name: string;
  beds: string;
  maxGuests: number;
  breakfastIncluded: boolean;
  cancellation: CancellationType;
}

export interface Room {
  roomId: string;
  rateId: string;
  name: string;
  description: string;
  beds: Bed[];
  maxGuests: number;
  sizeSqm?: number;
  view?: string;
  amenities: string[];
  images: string[];
  rate: Rate;
  remainingRooms?: number;
}

export interface Bed {
  type: 'single' | 'double' | 'queen' | 'king' | 'sofa_bed' | 'bunk';
  count: number;
}

export interface Rate {
  name: string;
  board: BoardType;
  cancellation: CancellationPolicy;
  payment: PaymentPolicy;
  price: Price;
}

export type BoardType =
  | 'room_only'
  | 'breakfast_included'
  | 'half_board'
  | 'full_board'
  | 'all_inclusive';

export type CancellationType =
  | 'free_cancellation'
  | 'free_until_24h'
  | 'free_until_48h'
  | 'free_until_7d'
  | 'partial_refund'
  | 'non_refundable';

export interface CancellationPolicy {
  type: CancellationType;
  freeUntil?: string; // ISO datetime
  penaltyAfter?: {
    type: 'first_night' | 'percentage' | 'fixed';
    amount: number;
  };
}

export interface PaymentPolicy {
  type: 'pay_now' | 'pay_at_hotel' | 'deposit';
  methods: PaymentMethod[];
  depositAmount?: number;
}

export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'paypal';

// ============================================
// Availability Types
// ============================================

export interface AvailabilityParams {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms?: number;
  currency?: string;
}

export interface AvailabilityResult {
  status: 'success' | 'error';
  propertyId: string;
  property: Property;
  dates: DateRange;
  roomsAvailable: Room[];
}

// ============================================
// Booking Types
// ============================================

export interface BookingParams {
  propertyId: string;
  roomId: string;
  rateId: string;
  checkIn: string;
  checkOut: string;
  guest: Guest;
  additionalGuests?: Guest[];
  roomsCount?: number;
  specialRequests?: string;
  payment?: PaymentDetails;
  loyaltyProgram?: LoyaltyInfo;
}

export interface Guest {
  title?: 'Mr' | 'Mrs' | 'Ms' | 'Dr';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  address?: Address;
}

export interface PaymentDetails {
  method: PaymentMethod;
  card?: {
    number: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    holderName: string;
  };
}

export interface LoyaltyInfo {
  program: string;
  memberId: string;
}

export interface Booking {
  status: 'pending' | 'confirmed' | 'cancelled' | 'modified' | 'completed' | 'no_show';
  bookingId: string;
  confirmationNumber: string;
  property: {
    id: string;
    name: string;
    address: string;
    phone?: string;
  };
  dates: DateRange;
  room: {
    name: string;
    board: BoardType;
    guests: number;
  };
  guest: {
    name: string;
    email: string;
  };
  price: {
    currency: string;
    total: number;
    paid: number;
    balanceDue: number;
  };
  cancellationPolicy: {
    freeUntil?: string;
    refundIfCancelledNow: number;
  };
  documents?: {
    confirmationPdf?: string;
    invoicePdf?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Shared Types
// ============================================

export interface Address {
  street?: string;
  city: string;
  region?: string;
  country: string;
  postalCode?: string;
  coordinates?: Coordinates;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DateRange {
  checkIn: string;
  checkOut: string;
  nights: number;
}

export interface PriceSummary {
  currency: string;
  perNightAvg: number;
  total: number;
  taxesIncluded: boolean;
  taxesFees?: number;
  grandTotal: number;
}

export interface Price {
  currency: string;
  perNight: number[];
  subtotal: number;
  taxes: Tax[];
  fees: Fee[];
  total: number;
}

export interface Tax {
  name: string;
  amount: number;
  included: boolean;
}

export interface Fee {
  name: string;
  amount: number;
  type: 'per_night' | 'per_stay' | 'per_person';
}

// ============================================
// Error Types
// ============================================

export interface EywaError {
  status: 'error';
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
    suggestions?: ErrorSuggestion[];
  };
}

export type ErrorCode =
  | 'INVALID_DATES'
  | 'INVALID_GUESTS'
  | 'PROPERTY_NOT_FOUND'
  | 'ROOM_UNAVAILABLE'
  | 'RATE_EXPIRED'
  | 'PAYMENT_FAILED'
  | 'BOOKING_NOT_FOUND'
  | 'MODIFICATION_NOT_ALLOWED'
  | 'CANCELLATION_NOT_ALLOWED'
  | 'PROVIDER_ERROR'
  | 'INTERNAL_ERROR';

export interface ErrorSuggestion {
  action: string;
  tool: string;
  params?: Record<string, unknown>;
}
