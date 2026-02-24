/**
 * hotel/booking tool implementation
 */

import { getMockBooking } from '../providers/mock.js';

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

  // TODO: Route to actual provider
  const result = await getMockBooking(bookingId || confirmationNumber);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result),
    }],
  };
}
