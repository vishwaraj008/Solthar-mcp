const { AppError } = require('../utils/error');
const mcpService = require('../services/mcp.service');

async function processRequest(userId, apiKey, command, params) {
  try {
    // 1. Validate or preprocess inputs here if needed
    
    // 2. Execute command via service layer
    const result = await mcpService.execute(command, params, apiKey, userId);

    // 3. Return or format result as needed
    return {
      status: 'success',
      data: result,
      processedAt: new Date().toISOString(),
    };
  } catch (err) {
    if (!(err instanceof AppError)) {
      throw new AppError('MCP processing failed', 500, true, { raw: err });
    }
    throw err;
  }
}

module.exports = {
  processRequest,
};
