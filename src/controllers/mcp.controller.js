
const { ValidationError, AppError } = require('../utils/error');
const mcpService = require('../services/mcp.service');
const mcpProcessor = require('../processors/mcp.processor');

async function initializeMCP(req, res, next) {
    try {
        const result = await mcpService.initialize();

        res.status(200).json({
            success: true,
            message: 'MCP initialized successfully.',
            data: result
        });
    } catch (err) {
    if (!(err instanceof Error)) {
      return next(
        new AppError("Unhandled error while initialzing mcp", 500, true, {
          controller: "mcpContoller.initializeMCPController",
          raw: err,
        })
      );
    }
    console.log(err)
    if (!(err instanceof AppError)) {
      return next(
        new AppError("Unexpected error while initialzing mcp", 500, true, {
          controller: "pagesController.updatePageController",
          raw: err,
        })
      );
    }

    return next(err);
  
    }
}

async function executeMCPCommand(req, res, next) {
    try {
        const userId = req.headers['x-user-id'];
        const apiKey = req.headers['x-api-key'];
        const { tool, params } = req.body;

        if (!userId || !apiKey) {
            throw new ValidationError('User ID and API key are required in headers.');
        }

        if (!tool || typeof tool !== 'string') {
            throw new ValidationError('Command must be a valid string.');
        }

        // Call the processor (business logic orchestrator)
        const result = await mcpProcessor.processRequest(userId, apiKey, tool, params || {});

        res.status(200).json({
            success: true,
            message: 'MCP command executed successfully.',
            data: result,
        });
    } catch (err) {
        if (!(err instanceof Error)) {
            return next(
                new AppError("Unhandled error while executing MCP command", 500, true, {
                    controller: "mcpController.executeMCPCommand",
                    raw: err,
                })
            );
        }

        if (!(err instanceof AppError)) {
            return next(
                new AppError("Unexpected error while executing MCP command", 500, true, {
                    controller: "mcpController.executeMCPCommand",
                    raw: err,
                })
            );
        }

        return next(err);
    }
}


async function retrieveMCPStatus(req, res, next) {
  try {
    const status = await mcpService.getStatus();

    res.status(200).json({
      success: true,
      message: 'MCP status retrieved successfully.',
      data: status,
    });
  } catch (err) {
    if (!(err instanceof Error)) {
      return next(
        new AppError('Unhandled error while retrieving MCP status', 500, true, {
          controller: 'mcpController.retrieveMCPStatus',
          raw: err,
        })
      );
    }

    if (!(err instanceof AppError)) {
      return next(
        new AppError('Unexpected error while retrieving MCP status', 500, true, {
          controller: 'mcpController.retrieveMCPStatus',
          raw: err,
        })
      );
    }

    return next(err);
  }
}

async function listMCPCommands(req, res, next) {
  try {
    const commands = await mcpService.listCommands();

    res.status(200).json({
      success: true,
      message: 'MCP commands listed successfully.',
      data: commands,
    });
  } catch (err) {
    if (!(err instanceof Error)) {
      return next(
        new AppError('Unhandled error while listing MCP commands', 500, true, {
          controller: 'mcpController.listMCPCommands',
          raw: err,
        })
      );
    }

    if (!(err instanceof AppError)) {
      return next(
        new AppError('Unexpected error while listing MCP commands', 500, true, {
          controller: 'mcpController.listMCPCommands',
          raw: err,
        })
      );
    }

    return next(err);
  }
}

async function shutdownMCP(req, res, next) {
  try {
    const result = await mcpService.shutdown();

    res.status(200).json({
      success: true,
      message: 'MCP shutdown completed successfully.',
      data: result,
    });
  } catch (err) {
    if (!(err instanceof Error)) {
      return next(
        new AppError('Unhandled error during MCP shutdown', 500, true, {
          controller: 'mcpController.shutdownMCP',
          raw: err,
        })
      );
    }

    if (!(err instanceof AppError)) {
      return next(
        new AppError('Unexpected error during MCP shutdown', 500, true, {
          controller: 'mcpController.shutdownMCP',
          raw: err,
        })
      );
    }

    return next(err);
  }
}

module.exports = {
    initializeMCP,
    retrieveMCPStatus,
    listMCPCommands,
    shutdownMCP,
    executeMCPCommand
}