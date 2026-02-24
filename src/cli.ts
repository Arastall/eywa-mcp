#!/usr/bin/env node
/**
 * Eywa MCP CLI
 * Command-line interface for the Eywa MCP server
 */

import { startServer } from './index.js';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Eywa MCP Server - Universal AI-to-hotel booking protocol

Usage:
  eywa-mcp              Start MCP server on stdio (default)
  eywa-mcp --help       Show this help message
  eywa-mcp --version    Show version

Environment variables:
  EYWA_API_KEY          API key for Eywa service
  EYWA_DEBUG            Enable debug logging (1 or true)

For more information: https://eywa-ai.com
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log('eywa-mcp v0.1.0');
  process.exit(0);
}

// Start the MCP server
startServer().catch((error) => {
  console.error('Failed to start Eywa MCP server:', error);
  process.exit(1);
});
