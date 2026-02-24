/**
 * MCP Tool Definitions
 * Describes all available tools for AI agents
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const toolDefinitions: Tool[] = [
  {
    name: 'hotel/search',
    description: 'Search for hotels matching criteria. Returns a list of properties with summary info, prices, and availability status.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: {
          type: 'string',
          description: 'City, region, country, or property name to search',
        },
        check_in: {
          type: 'string',
          description: 'Check-in date in YYYY-MM-DD format',
        },
        check_out: {
          type: 'string',
          description: 'Check-out date in YYYY-MM-DD format',
        },
        guests: {
          type: 'integer',
          description: 'Total number of guests',
        },
        rooms: {
          type: 'integer',
          description: 'Number of rooms needed (default: 1)',
        },
        currency: {
          type: 'string',
          description: 'ISO 4217 currency code for prices (default: USD)',
        },
        filters: {
          type: 'object',
          description: 'Optional search filters',
          properties: {
            price_min: { type: 'number', description: 'Minimum price per night' },
            price_max: { type: 'number', description: 'Maximum price per night' },
            star_rating: {
              type: 'array',
              items: { type: 'integer' },
              description: 'Accepted star ratings (e.g., [4, 5])',
            },
            amenities: {
              type: 'array',
              items: { type: 'string' },
              description: 'Required amenities (wifi, pool, parking, breakfast, spa, gym)',
            },
            property_type: {
              type: 'array',
              items: { type: 'string' },
              description: 'Property types (hotel, resort, boutique, hostel, apartment, villa)',
            },
            guest_rating_min: {
              type: 'number',
              description: 'Minimum guest rating (0-10)',
            },
            refundable_only: {
              type: 'boolean',
              description: 'Only show refundable rates',
            },
            pay_at_hotel: {
              type: 'boolean',
              description: 'Only show pay-at-hotel options',
            },
          },
        },
        sort_by: {
          type: 'string',
          enum: ['price_asc', 'price_desc', 'rating', 'distance'],
          description: 'Sort order for results',
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of results (default: 20, max: 100)',
        },
      },
      required: ['destination', 'check_in', 'check_out', 'guests'],
    },
  },

  {
    name: 'hotel/availability',
    description: 'Get detailed room availability and rates for a specific property. Use after search to see all room options.',
    inputSchema: {
      type: 'object',
      properties: {
        property_id: {
          type: 'string',
          description: 'Property identifier from search results',
        },
        check_in: {
          type: 'string',
          description: 'Check-in date in YYYY-MM-DD format',
        },
        check_out: {
          type: 'string',
          description: 'Check-out date in YYYY-MM-DD format',
        },
        guests: {
          type: 'integer',
          description: 'Number of guests',
        },
        rooms: {
          type: 'integer',
          description: 'Number of rooms (default: 1)',
        },
        currency: {
          type: 'string',
          description: 'Currency code (default: USD)',
        },
      },
      required: ['property_id', 'check_in', 'check_out', 'guests'],
    },
  },

  {
    name: 'hotel/book',
    description: 'Create a hotel booking reservation. Requires property_id, room_id, and rate_id from availability check.',
    inputSchema: {
      type: 'object',
      properties: {
        property_id: {
          type: 'string',
          description: 'Property identifier',
        },
        room_id: {
          type: 'string',
          description: 'Room identifier from availability',
        },
        rate_id: {
          type: 'string',
          description: 'Rate plan identifier from availability',
        },
        check_in: {
          type: 'string',
          description: 'Check-in date',
        },
        check_out: {
          type: 'string',
          description: 'Check-out date',
        },
        guest: {
          type: 'object',
          description: 'Primary guest details',
          properties: {
            title: { type: 'string', enum: ['Mr', 'Mrs', 'Ms', 'Dr'] },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            country: { type: 'string', description: 'ISO country code' },
          },
          required: ['first_name', 'last_name', 'email'],
        },
        rooms_count: {
          type: 'integer',
          description: 'Number of rooms to book',
        },
        special_requests: {
          type: 'string',
          description: 'Special requests for the hotel',
        },
        payment: {
          type: 'object',
          description: 'Payment details (required if pay_now rate)',
          properties: {
            method: { type: 'string', enum: ['credit_card'] },
            card: {
              type: 'object',
              properties: {
                number: { type: 'string' },
                expiry_month: { type: 'integer' },
                expiry_year: { type: 'integer' },
                cvv: { type: 'string' },
                holder_name: { type: 'string' },
              },
            },
          },
        },
      },
      required: ['property_id', 'room_id', 'rate_id', 'check_in', 'check_out', 'guest'],
    },
  },

  {
    name: 'hotel/booking',
    description: 'Retrieve details of an existing booking by booking ID or confirmation number.',
    inputSchema: {
      type: 'object',
      properties: {
        booking_id: {
          type: 'string',
          description: 'Eywa booking ID (e.g., EYW-2026-ABC123)',
        },
        confirmation_number: {
          type: 'string',
          description: 'Hotel confirmation number',
        },
        guest_email: {
          type: 'string',
          description: 'Guest email for verification',
        },
      },
    },
  },

  {
    name: 'hotel/cancel',
    description: 'Cancel a hotel booking. Returns refund information based on cancellation policy.',
    inputSchema: {
      type: 'object',
      properties: {
        booking_id: {
          type: 'string',
          description: 'Booking ID to cancel',
        },
        reason: {
          type: 'string',
          description: 'Reason for cancellation',
        },
      },
      required: ['booking_id'],
    },
  },

  {
    name: 'hotel/modify',
    description: 'Modify an existing booking (change dates, room type, or guest count). May incur price changes.',
    inputSchema: {
      type: 'object',
      properties: {
        booking_id: {
          type: 'string',
          description: 'Booking ID to modify',
        },
        new_check_in: {
          type: 'string',
          description: 'New check-in date',
        },
        new_check_out: {
          type: 'string',
          description: 'New check-out date',
        },
        new_room_id: {
          type: 'string',
          description: 'New room type ID',
        },
        new_guests: {
          type: 'integer',
          description: 'Updated guest count',
        },
        additional_requests: {
          type: 'string',
          description: 'Additional special requests',
        },
      },
      required: ['booking_id'],
    },
  },
];
