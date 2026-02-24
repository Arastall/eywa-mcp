/**
 * Eywa MCP Server
 * Universal AI-to-hotel booking protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { searchHotels } from './tools/search.js';
import { getAvailability } from './tools/availability.js';
import { createBooking } from './tools/book.js';
import { getBooking } from './tools/booking.js';
import { cancelBooking } from './tools/cancel.js';
import { modifyBooking } from './tools/modify.js';
import { toolDefinitions } from './tools/definitions.js';

// Create MCP server
const server = new Server(
  {
    name: 'eywa-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: toolDefinitions };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'hotel/search':
        return await searchHotels(args);

      case 'hotel/availability':
        return await getAvailability(args);

      case 'hotel/book':
        return await createBooking(args);

      case 'hotel/booking':
        return await getBooking(args);

      case 'hotel/cancel':
        return await cancelBooking(args);

      case 'hotel/modify':
        return await modifyBooking(args);

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'error',
                error: {
                  code: 'UNKNOWN_TOOL',
                  message: `Unknown tool: ${name}`,
                },
              }),
            },
          ],
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'error',
            error: {
              code: 'INTERNAL_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error',
            },
          }),
        },
      ],
    };
  }
});

// Start server
export async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Eywa MCP server running on stdio');
}

export { server };
