# Eywa MCP Hotel Booking Schema

**Version:** 0.1.0-draft  
**Status:** Draft for review  
**Date:** 2026-02-24  
**Authors:** Cenaia Labs / Raken AI

---

## Overview

This schema defines the Model Context Protocol (MCP) interface for AI agents to search, check availability, and book hotel accommodations. Designed to be the universal standard for agent-to-hotel communication.

**Design Principles:**
- Agent-first: Optimized for LLM function calling
- Minimal round-trips: Rich responses to reduce back-and-forth
- Human-readable: Clear field names, no cryptic codes
- Extensible: Optional fields for advanced use cases
- Currency-agnostic: Multi-currency support built-in

---

## MCP Server Info

```json
{
  "name": "eywa-hotel",
  "version": "0.1.0",
  "description": "Universal hotel booking interface for AI agents",
  "protocol": "mcp",
  "capabilities": ["search", "availability", "booking", "management"]
}
```

---

## Tools

### 1. `hotel/search`

Search for hotels matching criteria. Returns a list of properties with summary info.

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `destination` | string | ✓ | City, region, or property name |
| `check_in` | date | ✓ | Check-in date (YYYY-MM-DD) |
| `check_out` | date | ✓ | Check-out date (YYYY-MM-DD) |
| `guests` | integer | ✓ | Number of guests |
| `rooms` | integer | | Number of rooms (default: 1) |
| `currency` | string | | ISO 4217 currency code (default: USD) |
| `filters` | object | | Optional filters (see below) |
| `sort_by` | string | | `price_asc`, `price_desc`, `rating`, `distance` |
| `limit` | integer | | Max results (default: 20, max: 100) |
| `offset` | integer | | Pagination offset |

**Filters Object:**

```json
{
  "price_min": 50,
  "price_max": 300,
  "star_rating": [4, 5],
  "amenities": ["wifi", "pool", "parking", "breakfast"],
  "property_type": ["hotel", "resort", "boutique"],
  "guest_rating_min": 8.0,
  "distance_km": 5,
  "distance_from": {"lat": 41.0082, "lng": 28.9784},
  "refundable_only": true,
  "pay_at_hotel": true
}
```

**Response:**

```json
{
  "status": "success",
  "search_id": "srch_abc123",
  "destination": "Istanbul, Turkey",
  "dates": {
    "check_in": "2026-03-15",
    "check_out": "2026-03-18",
    "nights": 3
  },
  "total_results": 142,
  "results": [
    {
      "property_id": "prop_xyz789",
      "name": "Grand Hyatt Istanbul",
      "star_rating": 5,
      "guest_rating": 9.1,
      "guest_reviews_count": 2847,
      "address": {
        "street": "Taskisla Caddesi No:1",
        "city": "Istanbul",
        "region": "Beyoglu",
        "country": "TR",
        "postal_code": "34437",
        "coordinates": {"lat": 41.0451, "lng": 28.9947}
      },
      "images": {
        "thumbnail": "https://...",
        "gallery": ["https://...", "https://..."]
      },
      "amenities": ["wifi", "pool", "spa", "gym", "restaurant", "parking"],
      "price_summary": {
        "currency": "USD",
        "per_night_avg": 185,
        "total": 555,
        "taxes_included": false,
        "taxes_fees": 72,
        "grand_total": 627
      },
      "room_preview": {
        "name": "Deluxe King Room",
        "beds": "1 King",
        "max_guests": 2,
        "breakfast_included": true,
        "cancellation": "free_until_24h"
      },
      "badges": ["top_rated", "free_cancellation"],
      "availability_status": "available"
    }
  ],
  "facets": {
    "price_range": {"min": 45, "max": 890},
    "star_ratings": {"3": 28, "4": 67, "5": 47},
    "amenities": {"wifi": 142, "pool": 89, "parking": 112}
  }
}
```

---

### 2. `hotel/availability`

Get detailed room availability and rates for a specific property.

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `property_id` | string | ✓ | Property identifier |
| `check_in` | date | ✓ | Check-in date |
| `check_out` | date | ✓ | Check-out date |
| `guests` | integer | ✓ | Number of guests |
| `rooms` | integer | | Number of rooms (default: 1) |
| `currency` | string | | Currency code |

**Response:**

```json
{
  "status": "success",
  "property_id": "prop_xyz789",
  "property": {
    "name": "Grand Hyatt Istanbul",
    "star_rating": 5,
    "check_in_time": "15:00",
    "check_out_time": "12:00",
    "policies": {
      "children": "Children of all ages welcome",
      "pets": "Pets not allowed",
      "smoking": "Non-smoking property"
    },
    "contact": {
      "phone": "+90 212 368 1234",
      "email": "istanbul.grand@hyatt.com"
    }
  },
  "dates": {
    "check_in": "2026-03-15",
    "check_out": "2026-03-18",
    "nights": 3
  },
  "rooms_available": [
    {
      "room_id": "room_abc",
      "rate_id": "rate_123",
      "name": "Deluxe King Room",
      "description": "45 sqm room with city view, king bed, marble bathroom",
      "beds": [{"type": "king", "count": 1}],
      "max_guests": 2,
      "size_sqm": 45,
      "view": "city",
      "amenities": ["wifi", "minibar", "safe", "tv", "air_conditioning", "room_service"],
      "images": ["https://..."],
      "rate": {
        "name": "Best Available Rate",
        "board": "breakfast_included",
        "cancellation": {
          "type": "free_cancellation",
          "free_until": "2026-03-14T15:00:00+03:00",
          "penalty_after": {
            "type": "first_night",
            "amount": 185
          }
        },
        "payment": {
          "type": "pay_now",
          "methods": ["credit_card"]
        },
        "price": {
          "currency": "USD",
          "per_night": [185, 185, 185],
          "subtotal": 555,
          "taxes": [
            {"name": "VAT", "amount": 44.40, "included": false},
            {"name": "City Tax", "amount": 27.60, "included": false}
          ],
          "fees": [],
          "total": 627
        }
      },
      "remaining_rooms": 3
    },
    {
      "room_id": "room_def",
      "rate_id": "rate_456",
      "name": "Grand Suite",
      "description": "85 sqm suite with Bosphorus view, separate living area",
      "beds": [{"type": "king", "count": 1}, {"type": "sofa_bed", "count": 1}],
      "max_guests": 3,
      "size_sqm": 85,
      "view": "bosphorus",
      "amenities": ["wifi", "minibar", "safe", "tv", "air_conditioning", "room_service", "lounge_access", "butler"],
      "images": ["https://..."],
      "rate": {
        "name": "Suite Special",
        "board": "half_board",
        "cancellation": {
          "type": "non_refundable"
        },
        "payment": {
          "type": "pay_at_hotel",
          "methods": ["credit_card", "cash"]
        },
        "price": {
          "currency": "USD",
          "per_night": [420, 420, 420],
          "subtotal": 1260,
          "taxes": [
            {"name": "VAT", "amount": 100.80, "included": false},
            {"name": "City Tax", "amount": 50.40, "included": false}
          ],
          "fees": [],
          "total": 1411.20
        }
      },
      "remaining_rooms": 1
    }
  ]
}
```

---

### 3. `hotel/book`

Create a booking reservation.

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `property_id` | string | ✓ | Property identifier |
| `room_id` | string | ✓ | Room identifier |
| `rate_id` | string | ✓ | Rate plan identifier |
| `check_in` | date | ✓ | Check-in date |
| `check_out` | date | ✓ | Check-out date |
| `guest` | object | ✓ | Primary guest details |
| `additional_guests` | array | | Other guests |
| `rooms_count` | integer | | Number of rooms |
| `special_requests` | string | | Free text requests |
| `payment` | object | ✓* | Payment details (*if pay_now) |
| `loyalty_program` | object | | Loyalty membership |

**Guest Object:**

```json
{
  "title": "Mr",
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@email.com",
  "phone": "+1-555-123-4567",
  "country": "US",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "postal_code": "10001",
    "country": "US"
  }
}
```

**Payment Object:**

```json
{
  "method": "credit_card",
  "card": {
    "number": "4111111111111111",
    "expiry_month": 12,
    "expiry_year": 2028,
    "cvv": "123",
    "holder_name": "John Smith"
  }
}
```

**Response:**

```json
{
  "status": "confirmed",
  "booking_id": "EYW-2026-ABC123",
  "confirmation_number": "HY-789456123",
  "property": {
    "id": "prop_xyz789",
    "name": "Grand Hyatt Istanbul",
    "address": "Taskisla Caddesi No:1, Istanbul",
    "phone": "+90 212 368 1234"
  },
  "dates": {
    "check_in": "2026-03-15",
    "check_out": "2026-03-18",
    "nights": 3
  },
  "room": {
    "name": "Deluxe King Room",
    "board": "breakfast_included",
    "guests": 2
  },
  "guest": {
    "name": "Mr John Smith",
    "email": "john.smith@email.com"
  },
  "price": {
    "currency": "USD",
    "total": 627,
    "paid": 627,
    "balance_due": 0
  },
  "cancellation_policy": {
    "free_until": "2026-03-14T15:00:00+03:00",
    "refund_if_cancelled_now": 627
  },
  "documents": {
    "confirmation_pdf": "https://...",
    "invoice_pdf": "https://..."
  },
  "actions": {
    "cancel": "hotel/cancel",
    "modify": "hotel/modify",
    "view": "hotel/booking"
  }
}
```

---

### 4. `hotel/booking`

Retrieve booking details.

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `booking_id` | string | ✓* | Eywa booking ID |
| `confirmation_number` | string | ✓* | Hotel confirmation number |
| `guest_email` | string | | For verification |

*One of booking_id or confirmation_number required

**Response:** Same structure as booking confirmation.

---

### 5. `hotel/cancel`

Cancel a booking.

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `booking_id` | string | ✓ | Booking identifier |
| `reason` | string | | Cancellation reason |

**Response:**

```json
{
  "status": "cancelled",
  "booking_id": "EYW-2026-ABC123",
  "cancellation_id": "CXL-456789",
  "refund": {
    "amount": 627,
    "currency": "USD",
    "method": "original_payment",
    "estimated_days": 5
  },
  "cancelled_at": "2026-03-10T14:30:00Z"
}
```

---

### 6. `hotel/modify`

Modify an existing booking (dates, room type, guest count).

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `booking_id` | string | ✓ | Booking identifier |
| `new_check_in` | date | | New check-in date |
| `new_check_out` | date | | New check-out date |
| `new_room_id` | string | | Different room type |
| `new_guests` | integer | | Updated guest count |
| `additional_requests` | string | | New special requests |

**Response:**

```json
{
  "status": "modified",
  "booking_id": "EYW-2026-ABC123",
  "changes": {
    "check_out": {"from": "2026-03-18", "to": "2026-03-19"}
  },
  "price_difference": {
    "currency": "USD",
    "original": 627,
    "new": 836,
    "to_pay": 209
  },
  "payment_required": true,
  "payment_link": "https://..."
}
```

---

## Data Types Reference

### Board Types

| Code | Description |
|------|-------------|
| `room_only` | No meals included |
| `breakfast_included` | Breakfast included |
| `half_board` | Breakfast + dinner |
| `full_board` | All meals |
| `all_inclusive` | All meals + drinks + activities |

### Cancellation Types

| Code | Description |
|------|-------------|
| `free_cancellation` | Free until deadline |
| `non_refundable` | No refund |
| `partial_refund` | Partial refund available |

### Amenity Codes

```
wifi, pool, spa, gym, restaurant, bar, parking, 
airport_shuttle, business_center, concierge, 
room_service, laundry, pet_friendly, ev_charging,
beach_access, golf, tennis, kids_club, casino
```

### Property Types

```
hotel, resort, boutique, motel, hostel, 
apartment, villa, guesthouse, bed_and_breakfast,
ryokan, riad, lodge, cabin, glamping
```

---

## Error Handling

```json
{
  "status": "error",
  "error": {
    "code": "ROOM_UNAVAILABLE",
    "message": "The selected room is no longer available for these dates",
    "details": {
      "property_id": "prop_xyz789",
      "room_id": "room_abc",
      "dates": ["2026-03-15", "2026-03-16"]
    },
    "suggestions": [
      {
        "action": "Try alternative room",
        "tool": "hotel/availability",
        "params": {"property_id": "prop_xyz789"}
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_DATES` | 400 | Check-out before check-in, past dates |
| `INVALID_GUESTS` | 400 | Guest count exceeds room capacity |
| `PROPERTY_NOT_FOUND` | 404 | Unknown property ID |
| `ROOM_UNAVAILABLE` | 409 | Room no longer available |
| `RATE_EXPIRED` | 409 | Price has changed, re-fetch |
| `PAYMENT_FAILED` | 402 | Payment declined |
| `BOOKING_NOT_FOUND` | 404 | Unknown booking ID |
| `MODIFICATION_NOT_ALLOWED` | 403 | Booking cannot be modified |
| `CANCELLATION_NOT_ALLOWED` | 403 | Past cancellation deadline |

---

## Rate Limiting

| Tier | Requests/min | Requests/day |
|------|--------------|--------------|
| Free | 60 | 1,000 |
| Pro | 300 | 50,000 |
| Enterprise | Unlimited | Unlimited |

---

## Webhooks (Optional)

Subscribe to booking events:

```json
{
  "event": "booking.confirmed",
  "booking_id": "EYW-2026-ABC123",
  "timestamp": "2026-03-10T14:30:00Z",
  "data": { ... }
}
```

Events: `booking.confirmed`, `booking.cancelled`, `booking.modified`, `booking.check_in`, `booking.check_out`, `booking.no_show`

---

## Implementation Notes

### For AI Agents

1. Always use `hotel/search` first to get property IDs
2. Use `hotel/availability` to get current rates before booking
3. Rate IDs expire after 30 minutes — re-fetch if stale
4. Handle `RATE_EXPIRED` gracefully by re-fetching availability

### For Hotel Providers

1. Map your internal room/rate codes to Eywa IDs
2. Push availability updates via webhook or polling
3. Confirm bookings within 30 seconds
4. Support cancellation status callbacks

---

## Changelog

- **0.1.0** (2026-02-24): Initial draft

---

## License

This schema specification is released under **MIT License**.  
Open for adoption, modification, and commercial use.

---

*Eywa — The universal language between AI and hospitality.*
