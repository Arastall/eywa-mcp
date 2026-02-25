/**
 * hotel/cancel tool implementation
 */

import { cancel } from '../providers/index.js';

export async function cancelBooking(args: Record<string, unknown>) {
  const bookingId = args.booking_id as string;
  const reason = args.reason as string;

  if (!bookingId) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          error: {
            code: 'INVALID_REQUEST',
            message: 'booking_id is required',
          },
        }),
      }],
    };
  }

  // Route to provider
  const propertyId = args.property_id as string | undefined;
  const result = await cancel(bookingId, propertyId, reason);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result),
    }],
  };
}
