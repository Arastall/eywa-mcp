# Codex Briefing: Eywa MCP Server

## Project Overview
Eywa is a Model Context Protocol (MCP) server that enables AI agents to search, check availability, and book hotel accommodations through a standardized interface.

**Vision:** Become the universal standard for AI-to-hotel communication — the "Stripe of hotel bookings" for AI agents.

## Current State
- ✅ Schema defined (`docs/MCP-HOTEL-SCHEMA.md`)
- ✅ TypeScript project structure
- ✅ Tool definitions (6 tools)
- ✅ Types for all data structures
- ✅ Mock provider for testing
- ⚠️ Not yet buildable (dependencies not installed)
- ⚠️ No tests yet
- ⚠️ No CLI entry point

## Priority Tasks

### 1. Make it buildable
```bash
npm install
npm run build
```
- Fix any TypeScript errors
- Ensure MCP SDK is properly imported
- Add missing type exports

### 2. Add CLI entry point
Create `src/cli.ts`:
- `eywa-mcp` — start MCP server on stdio (default)
- `eywa-mcp serve --port 3000` — HTTP mode (optional, lower priority)

### 3. Test with MCP Inspector
Ensure the server works with `npx @anthropic/mcp-inspector`:
- All 6 tools should be listed
- Tools should be callable with mock data

### 4. Add basic tests
Create tests for:
- Tool definitions are valid
- Mock provider returns correct structure
- Date validation works

### 5. Documentation
- Update README with actual usage
- Add CHANGELOG.md
- Add CONTRIBUTING.md

## Architecture Notes

### File Structure
```
src/
├── index.ts          # MCP server entry
├── cli.ts            # CLI wrapper (to create)
├── types.ts          # All TypeScript interfaces
├── tools/
│   ├── definitions.ts  # MCP tool schemas
│   ├── search.ts       # hotel/search implementation
│   ├── availability.ts # hotel/availability
│   ├── book.ts         # hotel/book
│   ├── booking.ts      # hotel/booking (retrieve)
│   ├── cancel.ts       # hotel/cancel
│   └── modify.ts       # hotel/modify
└── providers/
    └── mock.ts         # Fake data for testing
```

### MCP SDK Usage
Using `@modelcontextprotocol/sdk`. Key imports:
- `Server` from `@modelcontextprotocol/sdk/server/index.js`
- `StdioServerTransport` for stdio mode
- Tool responses must be `{ content: [{ type: 'text', text: JSON.stringify(data) }] }`

### Providers (Future)
The `providers/` directory will contain adapters for:
- Mews PMS API
- HotelRunner Channel Manager API
- SiteMinder API
- Direct hotel APIs

For now, only `mock.ts` exists for testing.

## Constraints
- Node.js 18+
- TypeScript strict mode
- ESM modules (not CommonJS)
- Follow existing code style

## Success Criteria
1. `npm run build` succeeds
2. `npx eywa-mcp` starts without errors
3. MCP Inspector can list and call all tools
4. At least one test passes

## Don't
- Don't implement real provider integrations yet
- Don't add authentication (mock only for now)
- Don't change the tool schemas without discussion
- Don't add unnecessary dependencies

## Resources
- MCP SDK: https://github.com/anthropics/model-context-protocol
- MCP Spec: https://spec.modelcontextprotocol.io/
- Schema: `docs/MCP-HOTEL-SCHEMA.md`
