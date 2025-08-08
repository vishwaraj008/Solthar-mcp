// src/routes/mcp.routes.js

const express = require('express');
const router = express.Router();

const mcpController = require('../controllers/mcp.controller');
const {jwtAuthMiddleware} = require("../middleware/auth.middleware")

// Initialize MCP
router.post('/initialize',jwtAuthMiddleware, mcpController.initializeMCP);

// Execute MCP command
router.post('/execute',jwtAuthMiddleware, mcpController.executeMCPCommand);

// Retrieve MCP status
router.get('/status',jwtAuthMiddleware, mcpController.retrieveMCPStatus);

// List available MCP commands
router.get('/commands',jwtAuthMiddleware, mcpController.listMCPCommands);

// Shutdown MCP
router.post('/shutdown',jwtAuthMiddleware, mcpController.shutdownMCP);

module.exports = router;
