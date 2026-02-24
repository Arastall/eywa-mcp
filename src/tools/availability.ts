/**
 * hotel/availability tool implementation
 */

import type { AvailabilityParams, AvailabilityResult } from '../types.js';
import { getMockAvailability } from '../providers/mock.js';

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

  // TODO: Route to actual provider
  const result = await getMockAvailability(params);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result),
    }],
  };
}
