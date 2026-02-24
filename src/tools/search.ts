/**
 * hotel/search tool implementation
 */

import type { SearchParams, SearchResult } from '../types.js';
import { getMockSearchResults } from '../providers/mock.js';

export async function searchHotels(args: Record<string, unknown>) {
  const params: SearchParams = {
    destination: args.destination as string,
    checkIn: args.check_in as string,
    checkOut: args.check_out as string,
    guests: args.guests as number,
    rooms: (args.rooms as number) || 1,
    currency: (args.currency as string) || 'USD',
    filters: args.filters as SearchParams['filters'],
    sortBy: args.sort_by as SearchParams['sortBy'],
    limit: (args.limit as number) || 20,
    offset: (args.offset as number) || 0,
  };

  // Validate dates
  const checkIn = new Date(params.checkIn);
  const checkOut = new Date(params.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          error: {
            code: 'INVALID_DATES',
            message: 'Check-in date cannot be in the past',
          },
        }),
      }],
    };
  }

  if (checkOut <= checkIn) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          error: {
            code: 'INVALID_DATES',
            message: 'Check-out date must be after check-in date',
          },
        }),
      }],
    };
  }

  // TODO: Route to actual provider based on destination
  // For now, use mock provider
  const result = await getMockSearchResults(params);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result),
    }],
  };
}
