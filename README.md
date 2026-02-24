# Eywa MCP Server

**The universal AI-to-hotel booking protocol.**

Eywa is an MCP (Model Context Protocol) server that enables AI agents to search, check availability, and book hotel accommodations through a standardized interface.

## 🎯 Vision

Become the **Stripe of hotel bookings** for AI agents. One integration, access to all hotels.

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│  AI Agent   │────▶│  Eywa MCP   │────▶│  Hotel Systems  │
│ (Claude,    │     │   Server    │     │  - PMS (OPERA,  │
│  GPT, etc)  │◀────│             │◀────│    Mews, etc)   │
└─────────────┘     └─────────────┘     │  - Channel Mgrs │
                                        │  - Direct APIs  │
                                        └─────────────────┘
```

## 🛠️ MCP Tools

| Tool | Description |
|------|-------------|
| `hotel/search` | Search hotels by destination, dates, guests |
| `hotel/availability` | Get rooms & rates for a property |
| `hotel/book` | Create a reservation |
| `hotel/booking` | Retrieve booking details |
| `hotel/cancel` | Cancel a booking |
| `hotel/modify` | Modify an existing booking |

## 📦 Installation

```bash
npm install eywa-mcp
```

## 🚀 Quick Start

### As MCP Server (for Claude, etc.)

```json
{
  "mcpServers": {
    "eywa": {
      "command": "npx",
      "args": ["eywa-mcp"],
      "env": {
        "EYWA_API_KEY": "your-api-key"
      }
    }
  }
}
```

### As HTTP API

```bash
eywa-mcp serve --port 3000
```

### Programmatic

```typescript
import { EywaMCP } from 'eywa-mcp';

const eywa = new EywaMCP({ apiKey: 'your-key' });

// Search hotels
const results = await eywa.search({
  destination: 'Istanbul',
  checkIn: '2026-03-15',
  checkOut: '2026-03-18',
  guests: 2
});

// Book
const booking = await eywa.book({
  propertyId: results[0].propertyId,
  roomId: results[0].rooms[0].roomId,
  rateId: results[0].rooms[0].rateId,
  guest: {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@example.com'
  }
});
```

## 📋 Schema

See [docs/MCP-HOTEL-SCHEMA.md](docs/MCP-HOTEL-SCHEMA.md) for the full protocol specification.

## 🔌 Supported Integrations

### PMS (Property Management Systems)
- [ ] Oracle OPERA Cloud
- [ ] Mews
- [ ] Cloudbeds
- [ ] Apaleo
- [ ] Protel
- [ ] Clock PMS
- [ ] *More coming...*

### Channel Managers
- [ ] HotelRunner
- [ ] SiteMinder
- [ ] D-EDGE
- [ ] *More coming...*

## 🗺️ Roadmap

- [x] MCP Schema v0.1
- [ ] Core MCP server (TypeScript)
- [ ] Mock provider for testing
- [ ] First PMS integration (Mews)
- [ ] HotelRunner integration
- [ ] Claude Desktop integration
- [ ] OpenAI plugin
- [ ] SDK (Python, Node)

## 🤝 Contributing

We're building the open standard for AI-hotel communication. Contributions welcome!

## 📄 License

MIT License - Open for adoption and commercial use.

---

**Eywa** — *The universal language between AI and hospitality.*

Built by [Cenaia Labs](https://cenaia-labs.com) & [Raken AI](https://raken.ai)
