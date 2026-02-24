/**
 * hotel/book tool implementation
 */

import type { BookingParams, Booking } from '../types.js';
import { createMockBooking } from '../providers/mock.js';

export async function createBooking(args: Record<string, unknown>) {
  const guestData = args.guest as Record<string, unknown>;
  
  const params: BookingParams = {
    propertyId: args.property_id as string,
    roomId: args.room_id as string,
    rateId: args.rate_id as string,
    checkIn: args.check_in as string,
    checkOut: args.check_out as string,
    guest: {
      title: guestData?.title as BookingParams['guest']['title'],
      firstName: guestData?.first_name as string,
      lastName: guestData?.last_name as string,
      email: guestData?.email as string,
      phone: guestData?.phone as string,
      country: guestData?.country as string,
    },
    roomsCount: (args.rooms_count as number) || 1,
    specialRequests: args.special_requests as string,
  };

  // Validate required fields
  if (!params.propertyId || !params.roomId || !params.rateId) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          error: {
            code: 'INVALID_REQUEST',
            message: 'property_id, room_id, and rate_id are required',
            suggestions: [{
              action: 'Get available rooms first',
              tool: 'hotel/availability',
            }],
          },
        }),
      }],
    };
  }

  if (!params.guest.firstName || !params.guest.lastName || !params.guest.email) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          error: {
            code: 'INVALID_REQUEST',
            message: 'Guest first_name, last_name, and email are required',
          },
        }),
      }],
    };
  }

  // TODO: Route to actual provider
  const result = await createMockBooking(params);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result),
    }],
  };
}
