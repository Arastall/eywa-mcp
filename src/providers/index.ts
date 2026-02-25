/**
 * Provider Registry
 * Routes requests to the appropriate provider based on configuration
 */

import type {
  SearchParams,
  SearchResult,
  AvailabilityParams,
  AvailabilityResult,
  BookingParams,
  Booking,
  EywaError,
} from '../types.js';

// Provider imports
import {
  getMockSearchResults,
  getMockAvailability,
  createMockBooking,
  getMockBooking,
  cancelMockBooking,
  modifyMockBooking,
} from './mock.js';

import {
  searchHotelRunner,
  getHotelRunnerAvailability,
  getHotelRunnerBooking,
  createHotelRunnerBooking,
  cancelHotelRunnerBooking,
  registerProperty as registerHRProperty,
  type HotelRunnerProperty,
} from './hotelrunner.js';

// ============================================
// Provider Types
// ============================================

export type ProviderType = 'mock' | 'hotelrunner';

export interface ProviderConfig {
  default: ProviderType;
  destinations?: Record<string, ProviderType>;
  properties?: Record<string, ProviderType>;
}

// Default configuration - use mock for everything
let providerConfig: ProviderConfig = {
  default: 'mock',
};

// ============================================
// Configuration
// ============================================

/**
 * Set provider configuration
 */
export function configureProviders(config: ProviderConfig): void {
  providerConfig = config;
}

/**
 * Register a HotelRunner property
 */
export function registerHotelRunnerProperty(property: HotelRunnerProperty): void {
  registerHRProperty(property);
  
  // Auto-configure this property to use HotelRunner
  if (!providerConfig.properties) {
    providerConfig.properties = {};
  }
  providerConfig.properties[property.id] = 'hotelrunner';
}

/**
 * Get provider for a destination or property
 */
function getProvider(opts: { destination?: string; propertyId?: string }): ProviderType {
  // Property-specific provider takes precedence
  if (opts.propertyId && providerConfig.properties?.[opts.propertyId]) {
    return providerConfig.properties[opts.propertyId];
  }
  
  // Check destination-based routing
  if (opts.destination && providerConfig.destinations) {
    const dest = opts.destination.toLowerCase();
    for (const [pattern, provider] of Object.entries(providerConfig.destinations)) {
      if (dest.includes(pattern.toLowerCase())) {
        return provider;
      }
    }
  }
  
  return providerConfig.default;
}

// ============================================
// Search
// ============================================

export async function search(params: SearchParams): Promise<SearchResult> {
  const provider = getProvider({ destination: params.destination });
  
  switch (provider) {
    case 'hotelrunner':
      return searchHotelRunner(params);
    
    case 'mock':
    default:
      return getMockSearchResults(params);
  }
}

// ============================================
// Availability
// ============================================

export async function availability(params: AvailabilityParams): Promise<AvailabilityResult | EywaError> {
  const provider = getProvider({ propertyId: params.propertyId });
  
  switch (provider) {
    case 'hotelrunner':
      return getHotelRunnerAvailability(params);
    
    case 'mock':
    default:
      return getMockAvailability(params);
  }
}

// ============================================
// Booking
// ============================================

export async function book(params: BookingParams): Promise<Booking | EywaError> {
  const provider = getProvider({ propertyId: params.propertyId });
  
  switch (provider) {
    case 'hotelrunner':
      return createHotelRunnerBooking(params);
    
    case 'mock':
    default:
      return createMockBooking(params);
  }
}

export async function getBookingDetails(
  bookingId: string,
  propertyId?: string
): Promise<Booking | EywaError | { status: 'error'; error: { code: string; message: string } }> {
  // If property specified, use that provider
  if (propertyId) {
    const provider = getProvider({ propertyId });
    switch (provider) {
      case 'hotelrunner':
        return getHotelRunnerBooking(bookingId, propertyId);
      default:
        return getMockBooking(bookingId);
    }
  }
  
  // Try to detect from booking ID format
  if (bookingId.startsWith('R') && /^R\d{9}$/.test(bookingId)) {
    // HotelRunner format: R followed by 9 digits
    return getHotelRunnerBooking(bookingId);
  }
  
  // Default to mock
  return getMockBooking(bookingId);
}

// ============================================
// Cancellation
// ============================================

export async function cancel(
  bookingId: string,
  propertyId?: string,
  reason?: string
): Promise<unknown> {
  if (propertyId) {
    const provider = getProvider({ propertyId });
    switch (provider) {
      case 'hotelrunner':
        return cancelHotelRunnerBooking(bookingId, propertyId, reason);
      default:
        return cancelMockBooking(bookingId, reason);
    }
  }
  
  return cancelMockBooking(bookingId, reason);
}

// ============================================
// Modification
// ============================================

export async function modify(
  bookingId: string,
  modifications: {
    newCheckIn?: string;
    newCheckOut?: string;
    newRoomId?: string;
    newGuests?: number;
    additionalRequests?: string;
  }
): Promise<unknown> {
  // TODO: Add HotelRunner modification support
  return modifyMockBooking(bookingId, modifications);
}

// ============================================
// Exports
// ============================================

export type { HotelRunnerProperty };
