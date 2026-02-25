/**
 * hotel/availability tool implementation
 */

import type { AvailabilityParams } from '../types.js';
import { availability } from '../providers/index.js';

export async function getAvailability(args: Record<string, unknown>) {
  const params: AvailabilityParams = {
    propertyId: args.property_id as string,
    checkIn: args.check_in as string,
    checkOut: args.check_out as string,
    guests: args.guests as number,
    rooms: (args.rooms as number) || 1,
    currency: (args.currency as string) || 'USD',
  };

  if (!params.propertyId) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          error: {
            code: 'PROPERTY_NOT_FOUND',
            message: 'property_id is required',
          },
        }),
      }],
    };
  }

  // Route to provider based on property
  const result = await availability(params);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result),
    }],
  };
}
