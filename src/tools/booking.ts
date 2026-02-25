/**
 * hotel/booking tool implementation
 */

import { getBookingDetails } from '../providers/index.js';

export async function getBooking(args: Record<string, unknown>) {
  const bookingId = args.booking_id as string;
  const confirmationNumber = args.confirmation_number as string;

  if (!bookingId && !confirmationNumber) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          error: {
            code: 'INVALID_REQUEST',
            message: 'Either booking_id or confirmation_number is required',
          },
        }),
      }],
    };
  }

  // Route to provider (auto-detect from booking ID format)
  const propertyId = args.property_id as string | undefined;
  const result = await getBookingDetails(bookingId || confirmationNumber, propertyId);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result),
    }],
  };
}
