/**
 * Mock Provider
 * Returns fake data for testing and development
 */

import type {
  SearchParams,
  SearchResult,
  AvailabilityParams,
  AvailabilityResult,
  BookingParams,
  Booking,
} from '../types.js';

// Simple ID generator
function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
}

function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export async function getMockSearchResults(params: SearchParams): Promise<SearchResult> {
  const nights = calculateNights(params.checkIn, params.checkOut);
  
  // Generate mock hotels based on destination
  const mockHotels = [
    {
      propertyId: 'prop_grand_hyatt_ist',
      name: `Grand Hyatt ${params.destination}`,
      starRating: 5,
      guestRating: 9.1,
      guestReviewsCount: 2847,
      address: {
        city: params.destination,
        country: 'TR',
        coordinates: { lat: 41.0451, lng: 28.9947 },
      },
      images: {
        thumbnail: 'https://example.com/grand-hyatt-thumb.jpg',
        gallery: ['https://example.com/grand-hyatt-1.jpg'],
      },
      amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'parking'],
      priceSummary: {
        currency: params.currency || 'USD',
        perNightAvg: 185,
        total: 185 * nights,
        taxesIncluded: false,
        taxesFees: Math.round(185 * nights * 0.13),
        grandTotal: Math.round(185 * nights * 1.13),
      },
      roomPreview: {
        name: 'Deluxe King Room',
        beds: '1 King',
        maxGuests: 2,
        breakfastIncluded: true,
        cancellation: 'free_until_24h' as const,
      },
      badges: ['top_rated', 'free_cancellation'],
      availabilityStatus: 'available' as const,
    },
    {
      propertyId: 'prop_hilton_ist',
      name: `Hilton ${params.destination}`,
      starRating: 5,
      guestRating: 8.8,
      guestReviewsCount: 3421,
      address: {
        city: params.destination,
        country: 'TR',
        coordinates: { lat: 41.0391, lng: 28.9956 },
      },
      images: {
        thumbnail: 'https://example.com/hilton-thumb.jpg',
        gallery: ['https://example.com/hilton-1.jpg'],
      },
      amenities: ['wifi', 'pool', 'gym', 'restaurant', 'parking', 'business_center'],
      priceSummary: {
        currency: params.currency || 'USD',
        perNightAvg: 165,
        total: 165 * nights,
        taxesIncluded: false,
        taxesFees: Math.round(165 * nights * 0.13),
        grandTotal: Math.round(165 * nights * 1.13),
      },
      roomPreview: {
        name: 'Executive Room',
        beds: '1 King or 2 Twin',
        maxGuests: 2,
        breakfastIncluded: false,
        cancellation: 'free_until_48h' as const,
      },
      badges: ['free_cancellation'],
      availabilityStatus: 'available' as const,
    },
    {
      propertyId: 'prop_boutique_ist',
      name: `Boutique Hotel ${params.destination}`,
      starRating: 4,
      guestRating: 9.3,
      guestReviewsCount: 892,
      address: {
        city: params.destination,
        country: 'TR',
        coordinates: { lat: 41.0082, lng: 28.9784 },
      },
      images: {
        thumbnail: 'https://example.com/boutique-thumb.jpg',
        gallery: ['https://example.com/boutique-1.jpg'],
      },
      amenities: ['wifi', 'restaurant', 'bar', 'concierge'],
      priceSummary: {
        currency: params.currency || 'USD',
        perNightAvg: 95,
        total: 95 * nights,
        taxesIncluded: true,
        grandTotal: 95 * nights,
      },
      roomPreview: {
        name: 'Superior Double',
        beds: '1 Queen',
        maxGuests: 2,
        breakfastIncluded: true,
        cancellation: 'non_refundable' as const,
      },
      badges: ['top_rated', 'great_value'],
      availabilityStatus: 'limited' as const,
    },
  ];

  // Apply filters
  let filtered = mockHotels;
  
  if (params.filters?.starRating) {
    filtered = filtered.filter(h => params.filters!.starRating!.includes(h.starRating));
  }
  
  if (params.filters?.priceMax) {
    filtered = filtered.filter(h => h.priceSummary.perNightAvg <= params.filters!.priceMax!);
  }

  if (params.filters?.priceMin) {
    filtered = filtered.filter(h => h.priceSummary.perNightAvg >= params.filters!.priceMin!);
  }

  // Sort
  if (params.sortBy === 'price_asc') {
    filtered.sort((a, b) => a.priceSummary.perNightAvg - b.priceSummary.perNightAvg);
  } else if (params.sortBy === 'price_desc') {
    filtered.sort((a, b) => b.priceSummary.perNightAvg - a.priceSummary.perNightAvg);
  } else if (params.sortBy === 'rating') {
    filtered.sort((a, b) => b.guestRating - a.guestRating);
  }

  return {
    status: 'success',
    searchId: generateId('srch'),
    destination: params.destination,
    dates: {
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      nights,
    },
    totalResults: filtered.length,
    results: filtered.slice(0, params.limit || 20),
    facets: {
      priceRange: { min: 95, max: 185 },
      starRatings: { '4': 1, '5': 2 },
      amenities: { wifi: 3, pool: 2, gym: 2, restaurant: 3 },
    },
  };
}

export async function getMockAvailability(params: AvailabilityParams): Promise<AvailabilityResult> {
  const nights = calculateNights(params.checkIn, params.checkOut);
  
  // Generate free cancellation deadline (24h before check-in)
  const checkInDate = new Date(params.checkIn);
  checkInDate.setDate(checkInDate.getDate() - 1);
  const freeUntil = checkInDate.toISOString();

  return {
    status: 'success',
    propertyId: params.propertyId,
    property: {
      propertyId: params.propertyId,
      name: 'Grand Hyatt Istanbul',
      starRating: 5,
      guestRating: 9.1,
      guestReviewsCount: 2847,
      description: 'Luxury 5-star hotel in the heart of Istanbul with stunning Bosphorus views.',
      address: {
        street: 'Taskisla Caddesi No:1',
        city: 'Istanbul',
        region: 'Beyoglu',
        country: 'TR',
        postalCode: '34437',
        coordinates: { lat: 41.0451, lng: 28.9947 },
      },
      checkInTime: '15:00',
      checkOutTime: '12:00',
      images: ['https://example.com/grand-hyatt-1.jpg'],
      amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'parking'],
      policies: {
        children: 'Children of all ages welcome',
        pets: 'Pets not allowed',
        smoking: 'Non-smoking property',
      },
      contact: {
        phone: '+90 212 368 1234',
        email: 'istanbul.grand@hyatt.com',
      },
    },
    dates: {
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      nights,
    },
    roomsAvailable: [
      {
        roomId: 'room_deluxe_king',
        rateId: 'rate_bar',
        name: 'Deluxe King Room',
        description: '45 sqm room with city view, king bed, marble bathroom',
        beds: [{ type: 'king', count: 1 }],
        maxGuests: 2,
        sizeSqm: 45,
        view: 'city',
        amenities: ['wifi', 'minibar', 'safe', 'tv', 'air_conditioning', 'room_service'],
        images: ['https://example.com/deluxe-king.jpg'],
        rate: {
          name: 'Best Available Rate',
          board: 'breakfast_included',
          cancellation: {
            type: 'free_cancellation',
            freeUntil,
            penaltyAfter: { type: 'first_night', amount: 185 },
          },
          payment: {
            type: 'pay_now',
            methods: ['credit_card'],
          },
          price: {
            currency: params.currency || 'USD',
            perNight: Array(nights).fill(185),
            subtotal: 185 * nights,
            taxes: [
              { name: 'VAT', amount: Math.round(185 * nights * 0.08), included: false },
              { name: 'City Tax', amount: Math.round(185 * nights * 0.05), included: false },
            ],
            fees: [],
            total: Math.round(185 * nights * 1.13),
          },
        },
        remainingRooms: 3,
      },
      {
        roomId: 'room_grand_suite',
        rateId: 'rate_suite',
        name: 'Grand Suite',
        description: '85 sqm suite with Bosphorus view, separate living area',
        beds: [{ type: 'king', count: 1 }, { type: 'sofa_bed', count: 1 }],
        maxGuests: 3,
        sizeSqm: 85,
        view: 'bosphorus',
        amenities: ['wifi', 'minibar', 'safe', 'tv', 'air_conditioning', 'room_service', 'lounge_access', 'butler'],
        images: ['https://example.com/grand-suite.jpg'],
        rate: {
          name: 'Suite Special',
          board: 'half_board',
          cancellation: {
            type: 'non_refundable',
          },
          payment: {
            type: 'pay_at_hotel',
            methods: ['credit_card', 'cash'],
          },
          price: {
            currency: params.currency || 'USD',
            perNight: Array(nights).fill(420),
            subtotal: 420 * nights,
            taxes: [
              { name: 'VAT', amount: Math.round(420 * nights * 0.08), included: false },
              { name: 'City Tax', amount: Math.round(420 * nights * 0.04), included: false },
            ],
            fees: [],
            total: Math.round(420 * nights * 1.12),
          },
        },
        remainingRooms: 1,
      },
    ],
  };
}

export async function createMockBooking(params: BookingParams): Promise<Booking> {
  const nights = calculateNights(params.checkIn, params.checkOut);
  const total = 185 * nights * 1.13;
  
  const checkInDate = new Date(params.checkIn);
  checkInDate.setDate(checkInDate.getDate() - 1);
  
  return {
    status: 'confirmed',
    bookingId: generateId('EYW-2026'),
    confirmationNumber: `HY-${Math.random().toString().substring(2, 11)}`,
    property: {
      id: params.propertyId,
      name: 'Grand Hyatt Istanbul',
      address: 'Taskisla Caddesi No:1, Istanbul',
      phone: '+90 212 368 1234',
    },
    dates: {
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      nights,
    },
    room: {
      name: 'Deluxe King Room',
      board: 'breakfast_included',
      guests: params.guest ? 1 : 0,
    },
    guest: {
      name: `${params.guest.title || ''} ${params.guest.firstName} ${params.guest.lastName}`.trim(),
      email: params.guest.email,
    },
    price: {
      currency: 'USD',
      total: Math.round(total),
      paid: Math.round(total),
      balanceDue: 0,
    },
    cancellationPolicy: {
      freeUntil: checkInDate.toISOString(),
      refundIfCancelledNow: Math.round(total),
    },
    documents: {
      confirmationPdf: 'https://example.com/confirmation.pdf',
      invoicePdf: 'https://example.com/invoice.pdf',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getMockBooking(id: string): Promise<Booking | { status: 'error'; error: { code: string; message: string } }> {
  // Simulate not found for unknown IDs
  if (!id.startsWith('EYW-') && !id.startsWith('HY-')) {
    return {
      status: 'error',
      error: {
        code: 'BOOKING_NOT_FOUND',
        message: `Booking not found: ${id}`,
      },
    };
  }

  return {
    status: 'confirmed',
    bookingId: id.startsWith('EYW-') ? id : `EYW-2026-${id.substring(3)}`,
    confirmationNumber: id.startsWith('HY-') ? id : `HY-${id.substring(9)}`,
    property: {
      id: 'prop_grand_hyatt_ist',
      name: 'Grand Hyatt Istanbul',
      address: 'Taskisla Caddesi No:1, Istanbul',
      phone: '+90 212 368 1234',
    },
    dates: {
      checkIn: '2026-03-15',
      checkOut: '2026-03-18',
      nights: 3,
    },
    room: {
      name: 'Deluxe King Room',
      board: 'breakfast_included',
      guests: 2,
    },
    guest: {
      name: 'Mr John Smith',
      email: 'john.smith@example.com',
    },
    price: {
      currency: 'USD',
      total: 627,
      paid: 627,
      balanceDue: 0,
    },
    cancellationPolicy: {
      freeUntil: '2026-03-14T15:00:00Z',
      refundIfCancelledNow: 627,
    },
    createdAt: '2026-02-24T10:00:00Z',
    updatedAt: '2026-02-24T10:00:00Z',
  };
}

export async function cancelMockBooking(bookingId: string, reason?: string) {
  return {
    status: 'cancelled',
    bookingId,
    cancellationId: generateId('CXL'),
    refund: {
      amount: 627,
      currency: 'USD',
      method: 'original_payment',
      estimatedDays: 5,
    },
    reason,
    cancelledAt: new Date().toISOString(),
  };
}

export async function modifyMockBooking(
  bookingId: string,
  modifications: {
    newCheckIn?: string;
    newCheckOut?: string;
    newRoomId?: string;
    newGuests?: number;
    additionalRequests?: string;
  }
) {
  const changes: Record<string, { from: string; to: string }> = {};
  
  if (modifications.newCheckIn) {
    changes.checkIn = { from: '2026-03-15', to: modifications.newCheckIn };
  }
  if (modifications.newCheckOut) {
    changes.checkOut = { from: '2026-03-18', to: modifications.newCheckOut };
  }

  return {
    status: 'modified',
    bookingId,
    changes,
    priceDifference: {
      currency: 'USD',
      original: 627,
      new: 836,
      toPay: 209,
    },
    paymentRequired: Object.keys(changes).length > 0,
    updatedAt: new Date().toISOString(),
  };
}
