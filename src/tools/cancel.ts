/**
 * hotel/cancel tool implementation
 */

import { cancelMockBooking } from '../providers/mock.js';

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

  // TODO: Route to actual provider
  const result = await cancelMockBooking(bookingId, reason);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result),
    }],
  };
}
