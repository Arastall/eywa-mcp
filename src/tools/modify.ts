/**
 * hotel/modify tool implementation
 */

import { modify } from '../providers/index.js';

export async function modifyBooking(args: Record<string, unknown>) {
  const bookingId = args.booking_id as string;

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

  const modifications = {
    newCheckIn: args.new_check_in as string,
    newCheckOut: args.new_check_out as string,
    newRoomId: args.new_room_id as string,
    newGuests: args.new_guests as number,
    additionalRequests: args.additional_requests as string,
  };

  // Route to provider
  const result = await modify(bookingId, modifications);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result),
    }],
  };
}
