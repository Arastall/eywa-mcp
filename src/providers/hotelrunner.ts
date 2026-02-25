/**
 * HotelRunner Provider
 * Connects to HotelRunner Channel Manager REST API
 * 
 * API Docs: https://developers.hotelrunner.com
 */

import type {
  SearchParams,
  SearchResult,
  AvailabilityParams,
  AvailabilityResult,
  BookingParams,
  Booking,
  Room,
  PropertySummary,
  Property,
  EywaError,
} from '../types.js';

// ============================================
// Configuration & Types
// ============================================

const HR_BASE_URL = 'https://app.hotelrunner.com/api/v2/apps';

export interface HotelRunnerCredentials {
  token: string;
  hr_id: string;
}

export interface HotelRunnerProperty {
  id: string;             // Eywa internal ID
  hrId: string;           // HotelRunner property ID
  token: string;          // API token
  name: string;
  currency: string;
  timezone: string;
  location: {
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
}

// HotelRunner API Response Types
interface HRRoom {
  rate_code: string;
  inv_code: string;
  availability_update: boolean;
  restrictions_update: boolean;
  price_update: boolean;
  pricing_type: 'guest_based' | 'room_based';
  name: string;
  description: string;
  policy: string;
  room_capacity: number;
  adult_capacity: number;
  is_master: boolean;
  shared: boolean;
  channel_codes: string[];
  sales_currency: string;
  sell_online: boolean;
}

interface HRReservation {
  hr_number: string;
  provider_number: string | null;
  channel: string;
  channel_display: string;
  state: 'reserved' | 'confirmed' | 'canceled';
  modified: boolean;
  guest: string;
  cancel_reason: string | null;
  completed_at: string;
  updated_at: string;
  sub_total: number;
  extras_total: number;
  adjustments_total: number;
  tax_total: number;
  total: number;
  currency: string;
  checkin_date: string;
  checkout_date: string;
  note: string | null;
  payment: 'credit_card' | 'bank_transfer' | 'cash' | 'paypal';
  paid_amount: number;
  requires_response: boolean;
  address: {
    city: string;
    state: string;
    country: string;
    country_code: string;
    phone: string;
    email: string;
    street: string;
    street_2: string | null;
  };
  rooms: HRReservationRoom[];
}

interface HRReservationRoom {
  state: 'reserved' | 'confirmed' | 'canceled';
  rate_code: string;
  inv_code: string;
  price: number;
  non_refundable: boolean;
  nights: number;
  total_guest: number;
  total_adult: number;
  child_ages: number[];
  name: string;
  checkin_date: string;
  checkout_date: string;
  extra_info: string;
  daily_prices: { date: string; price: string }[];
  extras: { name: string; price: string }[];
}

// ============================================
// Property Registry (In-Memory for MVP)
// ============================================

// TODO: Replace with proper database/secrets manager
const propertyRegistry = new Map<string, HotelRunnerProperty>();

/**
 * Register a property with HotelRunner credentials
 */
export function registerProperty(property: HotelRunnerProperty): void {
  propertyRegistry.set(property.id, property);
}

/**
 * Get property by Eywa ID
 */
function getProperty(propertyId: string): HotelRunnerProperty | undefined {
  return propertyRegistry.get(propertyId);
}

/**
 * Get all registered properties
 */
function getAllProperties(): HotelRunnerProperty[] {
  return Array.from(propertyRegistry.values());
}

// ============================================
// Rate Limiting
// ============================================

interface RateLimitState {
  requestsToday: number;
  requestsThisMinute: number;
  lastResetDay: string;
  lastResetMinute: number;
}

const rateLimits = new Map<string, RateLimitState>();

const RATE_LIMITS = {
  PER_DAY: 250,
  PER_MINUTE: 5,
};

function checkRateLimit(hrId: string): boolean {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const minute = Math.floor(now.getTime() / 60000);
  
  let state = rateLimits.get(hrId) || {
    requestsToday: 0,
    requestsThisMinute: 0,
    lastResetDay: today,
    lastResetMinute: minute,
  };
  
  // Reset daily counter
  if (state.lastResetDay !== today) {
    state.requestsToday = 0;
    state.lastResetDay = today;
  }
  
  // Reset minute counter
  if (state.lastResetMinute !== minute) {
    state.requestsThisMinute = 0;
    state.lastResetMinute = minute;
  }
  
  // Check limits
  if (state.requestsToday >= RATE_LIMITS.PER_DAY) {
    console.warn(`Rate limit: ${hrId} hit daily limit (${RATE_LIMITS.PER_DAY})`);
    return false;
  }
  
  if (state.requestsThisMinute >= RATE_LIMITS.PER_MINUTE) {
    console.warn(`Rate limit: ${hrId} hit minute limit (${RATE_LIMITS.PER_MINUTE})`);
    return false;
  }
  
  // Increment counters
  state.requestsToday++;
  state.requestsThisMinute++;
  rateLimits.set(hrId, state);
  
  return true;
}

// ============================================
// API Client
// ============================================

async function hrApiRequest<T>(
  endpoint: string,
  credentials: HotelRunnerCredentials,
  options: {
    method?: 'GET' | 'PUT' | 'POST';
    params?: Record<string, string | number | boolean>;
    body?: Record<string, unknown>;
  } = {}
): Promise<T> {
  const { method = 'GET', params = {}, body } = options;
  
  // Check rate limit
  if (!checkRateLimit(credentials.hr_id)) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }
  
  // Build URL with auth params
  const url = new URL(`${HR_BASE_URL}${endpoint}`);
  url.searchParams.set('token', credentials.token);
  url.searchParams.set('hr_id', credentials.hr_id);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  };
  
  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }
  
  const response = await fetch(url.toString(), fetchOptions);
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HotelRunner API error: ${response.status} - ${text}`);
  }
  
  return response.json() as Promise<T>;
}

// ============================================
// Room/Inventory Cache
// ============================================

interface CachedRooms {
  rooms: HRRoom[];
  fetchedAt: number;
}

const roomsCache = new Map<string, CachedRooms>();
const ROOMS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function getRooms(property: HotelRunnerProperty): Promise<HRRoom[]> {
  const cacheKey = property.id;
  const cached = roomsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.fetchedAt < ROOMS_CACHE_TTL) {
    return cached.rooms;
  }
  
  const credentials: HotelRunnerCredentials = {
    token: property.token,
    hr_id: property.hrId,
  };
  
  const result = await hrApiRequest<{ rooms: HRRoom[] }>('/rooms', credentials);
  
  roomsCache.set(cacheKey, {
    rooms: result.rooms,
    fetchedAt: Date.now(),
  });
  
  return result.rooms;
}

// ============================================
// Public API - Provider Functions
// ============================================

/**
 * Search properties by destination
 * NOTE: HotelRunner doesn't have a search API - this searches registered properties
 */
export async function searchHotelRunner(params: SearchParams): Promise<SearchResult> {
  const nights = calculateNights(params.checkIn, params.checkOut);
  const results: PropertySummary[] = [];
  
  // Filter registered properties by destination
  const properties = getAllProperties().filter(p => {
    const dest = params.destination.toLowerCase();
    return (
      p.location.city.toLowerCase().includes(dest) ||
      p.location.country.toLowerCase().includes(dest) ||
      p.name.toLowerCase().includes(dest)
    );
  });
  
  // Fetch rooms for each matching property
  for (const property of properties) {
    try {
      const rooms = await getRooms(property);
      
      // Find cheapest available room
      const availableRooms = rooms.filter(r => r.sell_online && !r.is_master);
      if (availableRooms.length === 0) continue;
      
      // TODO: Get actual prices from availability API
      // For now, use placeholder pricing
      const cheapestRoom = availableRooms[0];
      const estimatedPrice = 100; // Placeholder - need price API
      
      results.push({
        propertyId: property.id,
        name: property.name,
        starRating: 4, // TODO: Get from property data
        guestRating: 8.5, // TODO: Get from reviews
        guestReviewsCount: 0,
        address: {
          city: property.location.city,
          country: property.location.country,
          coordinates: property.location.coordinates,
        },
        images: {
          thumbnail: '',
          gallery: [],
        },
        amenities: [],
        priceSummary: {
          currency: property.currency,
          perNightAvg: estimatedPrice,
          total: estimatedPrice * nights,
          taxesIncluded: false,
          grandTotal: Math.round(estimatedPrice * nights * 1.1),
        },
        roomPreview: {
          name: cheapestRoom.name,
          beds: `Max ${cheapestRoom.adult_capacity} adults`,
          maxGuests: cheapestRoom.room_capacity,
          breakfastIncluded: false,
          cancellation: cheapestRoom.rate_code.startsWith('NR:') ? 'non_refundable' : 'free_cancellation',
        },
        badges: [],
        availabilityStatus: 'available',
      });
    } catch (error) {
      console.error(`Failed to fetch rooms for ${property.id}:`, error);
    }
  }
  
  return {
    status: 'success',
    searchId: `hr_${Date.now()}`,
    destination: params.destination,
    dates: {
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      nights,
    },
    totalResults: results.length,
    results,
  };
}

/**
 * Get availability for a specific property
 */
export async function getHotelRunnerAvailability(params: AvailabilityParams): Promise<AvailabilityResult | EywaError> {
  const property = getProperty(params.propertyId);
  
  if (!property) {
    return {
      status: 'error',
      error: {
        code: 'PROPERTY_NOT_FOUND',
        message: `Property not found: ${params.propertyId}`,
      },
    };
  }
  
  const nights = calculateNights(params.checkIn, params.checkOut);
  
  try {
    const hrRooms = await getRooms(property);
    
    // Map HotelRunner rooms to Eywa format
    const roomsAvailable: Room[] = hrRooms
      .filter(r => r.sell_online && !r.is_master)
      .map(r => mapHRRoomToEywaRoom(r, nights, params.currency || property.currency));
    
    return {
      status: 'success',
      propertyId: params.propertyId,
      property: mapPropertyToEywa(property),
      dates: {
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        nights,
      },
      roomsAvailable,
    };
  } catch (error) {
    return {
      status: 'error',
      error: {
        code: 'PROVIDER_ERROR',
        message: `HotelRunner API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
    };
  }
}

/**
 * Get reservations from HotelRunner
 */
export async function getHotelRunnerReservations(
  propertyId: string,
  options: {
    fromDate?: string;
    undelivered?: boolean;
    reservationNumber?: string;
  } = {}
): Promise<HRReservation[]> {
  const property = getProperty(propertyId);
  if (!property) {
    throw new Error(`Property not found: ${propertyId}`);
  }
  
  const credentials: HotelRunnerCredentials = {
    token: property.token,
    hr_id: property.hrId,
  };
  
  const params: Record<string, string | number | boolean> = {
    per_page: 50,
  };
  
  if (options.fromDate) params.from_date = options.fromDate;
  if (options.undelivered !== undefined) params.undelivered = options.undelivered;
  if (options.reservationNumber) params.reservation_number = options.reservationNumber;
  
  const result = await hrApiRequest<{ reservations: HRReservation[] }>(
    '/reservations',
    credentials,
    { params }
  );
  
  return result.reservations;
}

/**
 * Get a specific booking
 */
export async function getHotelRunnerBooking(
  bookingId: string,
  propertyId?: string
): Promise<Booking | EywaError> {
  // Try all properties if not specified
  const propertiesToSearch = propertyId 
    ? [getProperty(propertyId)].filter(Boolean) as HotelRunnerProperty[]
    : getAllProperties();
  
  for (const property of propertiesToSearch) {
    try {
      const reservations = await getHotelRunnerReservations(property.id, {
        reservationNumber: bookingId,
        undelivered: false,
      });
      
      if (reservations.length > 0) {
        return mapHRReservationToBooking(reservations[0], property);
      }
    } catch (error) {
      console.error(`Error searching ${property.id}:`, error);
    }
  }
  
  return {
    status: 'error',
    error: {
      code: 'BOOKING_NOT_FOUND',
      message: `Booking not found: ${bookingId}`,
    },
  };
}

// ============================================
// Mapping Functions
// ============================================

function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function mapHRRoomToEywaRoom(hrRoom: HRRoom, nights: number, currency: string): Room {
  const isNonRefundable = hrRoom.rate_code.startsWith('NR:');
  const estimatedPrice = 100; // TODO: Get actual price from inventory API
  
  return {
    roomId: hrRoom.inv_code,
    rateId: hrRoom.rate_code,
    name: hrRoom.name,
    description: hrRoom.description || hrRoom.name,
    beds: [{ type: 'double', count: 1 }], // TODO: Parse from name/description
    maxGuests: hrRoom.room_capacity,
    amenities: [],
    images: [],
    rate: {
      name: isNonRefundable ? 'Non-Refundable Rate' : 'Standard Rate',
      board: 'room_only',
      cancellation: {
        type: isNonRefundable ? 'non_refundable' : 'free_cancellation',
      },
      payment: {
        type: 'pay_now',
        methods: ['credit_card'],
      },
      price: {
        currency,
        perNight: Array(nights).fill(estimatedPrice),
        subtotal: estimatedPrice * nights,
        taxes: [],
        fees: [],
        total: estimatedPrice * nights,
      },
    },
  };
}

function mapPropertyToEywa(property: HotelRunnerProperty): Property {
  return {
    propertyId: property.id,
    name: property.name,
    starRating: 4, // TODO: Get from property data
    guestRating: 0,
    guestReviewsCount: 0,
    description: '',
    address: {
      city: property.location.city,
      country: property.location.country,
      coordinates: property.location.coordinates,
    },
    checkInTime: '14:00',
    checkOutTime: '12:00',
    images: [],
    amenities: [],
    policies: {},
    contact: {},
  };
}

function mapHRReservationToBooking(res: HRReservation, property: HotelRunnerProperty): Booking {
  const nights = calculateNights(res.checkin_date, res.checkout_date);
  const room = res.rooms[0];
  
  return {
    status: mapReservationState(res.state),
    bookingId: res.hr_number,
    confirmationNumber: res.provider_number || res.hr_number,
    property: {
      id: property.id,
      name: property.name,
      address: `${property.location.city}, ${property.location.country}`,
    },
    dates: {
      checkIn: res.checkin_date,
      checkOut: res.checkout_date,
      nights,
    },
    room: {
      name: room?.name || 'Room',
      board: 'room_only',
      guests: room?.total_guest || 1,
    },
    guest: {
      name: res.guest,
      email: res.address.email,
    },
    price: {
      currency: res.currency,
      total: res.total,
      paid: res.paid_amount,
      balanceDue: res.total - res.paid_amount,
    },
    cancellationPolicy: {
      refundIfCancelledNow: room?.non_refundable ? 0 : res.total,
    },
    createdAt: res.completed_at,
    updatedAt: res.updated_at,
  };
}

function mapReservationState(state: string): Booking['status'] {
  switch (state) {
    case 'reserved': return 'pending';
    case 'confirmed': return 'confirmed';
    case 'canceled': return 'cancelled';
    default: return 'pending';
  }
}

// ============================================
// Booking Creation (Limited by HotelRunner API)
// ============================================

/**
 * Create a booking
 * NOTE: HotelRunner doesn't have a direct booking creation API.
 * Bookings come from OTA channels. For direct bookings, would need to:
 * 1. Use HotelRunner's booking widget (web)
 * 2. Create reservation in the property's PMS
 * 3. Use a different booking engine
 */
export async function createHotelRunnerBooking(_params: BookingParams): Promise<EywaError> {
  // HotelRunner is a Channel Manager, not a Booking Engine
  // It receives bookings from OTAs, it doesn't create them
  
  return {
    status: 'error',
    error: {
      code: 'PROVIDER_ERROR',
      message: 'HotelRunner does not support direct booking creation. Bookings must be made through connected OTA channels or the property\'s direct booking engine.',
      suggestions: [
        {
          action: 'Use the property\'s direct booking URL',
          tool: 'hotel/availability',
          params: { includeBookingUrl: true },
        },
      ],
    },
  };
}

/**
 * Cancel a booking
 * NOTE: Requires the property to support state updates
 */
export async function cancelHotelRunnerBooking(
  bookingId: string,
  propertyId: string,
  _reason?: string
): Promise<{ status: string; message: string } | EywaError> {
  const property = getProperty(propertyId);
  if (!property) {
    return {
      status: 'error',
      error: {
        code: 'PROPERTY_NOT_FOUND',
        message: `Property not found: ${propertyId}`,
      },
    };
  }
  
  // TODO: Implement state update API call
  // PUT /reservations/{booking_id}/state with state=canceled
  
  return {
    status: 'error',
    error: {
      code: 'PROVIDER_ERROR',
      message: 'Cancellation via HotelRunner API not yet implemented',
    },
  };
}
