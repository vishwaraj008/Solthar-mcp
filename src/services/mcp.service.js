const { AppError } = require('../utils/error');
const contextService = require('./context.service');
const toolService = require('./toolService');
const { randomUUID } = require('crypto');
const apiKeyModel = require('../models/api_keys');
const requestLogModel = require('../models/request_logs');
const contextLogModel = require('../models/context_logs');

async function initialize() {
  try {
    const mysqlConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    };
    const redisUrl = process.env.REDIS_URL;
    await contextService.initialize(redisUrl, mysqlConfig);

    return { initialized: true };
  } catch (err) {
    if (!(err instanceof AppError)) {
      throw new AppError('Failed to initialize MCP', 500, true, { raw: err });
    }
    throw err;
  }
}

async function validateApiKey(apiKey) {
  const keyData = await apiKeyModel.getApiKey(apiKey);
  if (!keyData) {
    throw new AppError('Invalid API key', 401, false, { apiKey });
  }
  checkUsageLimit(keyData);
  return keyData;
}

function checkUsageLimit(keyData) {
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    throw new AppError('API key expired', 401, false, { apiKey: keyData.api_key });
  }
  if (
    keyData.usage_limit !== null &&
    keyData.usage_limit !== undefined &&
    keyData.usage_count >= keyData.usage_limit
  ) {
    throw new AppError('API key usage limit exceeded', 429, false, { apiKey: keyData.api_key });
  }
}

async function incrementUsageCount(apiKey) {
  try {
    await apiKeyModel.incrementUsageCount(apiKey);
  } catch (err) {
    // Log error but don't break flow here if usage count increment fails
    console.error('Failed to increment usage count for API key:', apiKey, err);
  }
}

async function logRequest({ userId, apiKey, prompt, response, processingTimeMs, tool }) {
  await requestLogModel.createRequestLog({
    user_id: userId,
    request_payload: { api_key: apiKey, prompt },  // stored as JSON
    response_payload: { response },               // stored as JSON
    processing_time_ms: processingTimeMs ?? null,
    tool_used: tool || null
  });
}


async function getContext(userId) {
  return await contextLogModel.getContextLog(userId);
}

async function saveContext(userId, context) {
  const sessionId = randomUUID();
  await contextLogModel.saveContextLog(userId, context, sessionId);
  await contextService.setContext(userId, context);
}

async function execute(tool, params, apiKey, userId) {
  try {
    // 1. Validate API key
    await validateApiKey(apiKey);

    let result;

    switch (tool) {
      case 'Moad':
        if (!params.projectPath || !params.outputPath) {
          throw new AppError('Missing required params for generateDocs', 400);
        }

        const startTimeMoad = Date.now();

        // 2. Call Moad tool
        const moadResponse = await toolService.moad(
          params.projectPath,
          params.outputPath,
          params.includeIndirectLogic || false
        );

      const elapsedTime = Date.now() - startTimeMoad;

          await logRequest({
            userId,
            apiKey,
            prompt: `Generate docs for ${params.projectPath} -> ${params.outputPath}`,
            response: moadResponse.response,
            processingTimeMs: elapsedTime,
            tool: 'Moad'
          });
       

        result = moadResponse;
        break;

        case 'Athena':
        if (params.prompt) {  
        if (!params.prompt) {
            throw new AppError('Missing prompt for Athena', 400);
          }

          const existingContext = await getContext(userId);
          const fullPrompt = existingContext
            ? existingContext + '\n' + params.prompt
            : params.prompt;

          const athenaResponse = await toolService.athena(params, params.options);

          let updatedContext =
            (existingContext || '') +
            '\nUser: ' +
            params.prompt +
            '\nAthena: ' +
            athenaResponse.response;

          // Set max length to 500 characters
          updatedContext = contextService.truncateContextIfNeeded(updatedContext, 500);

          await saveContext(userId, updatedContext);
          await logRequest({
            userId,
            apiKey,
            prompt: params.prompt,
            response: athenaResponse.response,
            tool: 'AthenaRag',
          });

          result = athenaResponse;
          

        }else {
          const ingestFile = await toolService.athena(params, params.options);
          await logRequest({
            userId,
            apiKey,
            prompt: `Ingest file: ${params.file}`,
            response: ingestFile.response,
            tool: 'AthenaIngest',
          });
          result = ingestFile;
        }
        break;
      default:
        throw new AppError(`Unknown MCP tool: ${tool}`, 400);
    }

    // 5. Increment usage count after success
    await incrementUsageCount(apiKey);

    return result;
  } catch (err) {
    if (!(err instanceof AppError)) {
      throw new AppError('MCP command execution error', 500);
    }
    throw err;
  }
}


async function getStatus() {
  try {
    const uptime = process.uptime();
    const lastCommand = await contextService.getLastCommand() || 'none';

    return {
      uptime,
      status: 'running',
      lastCommand,
    };
  } catch (err) {
    console.log(err)
    throw new AppError('Failed to get MCP status', 500, true, { raw: err });
  }
}

async function listCommands() {
  return [
    {
      tool: 'Moad',
      description: 'Generate documentation for project source code',
      params: ['projectPath', 'outputDir', 'includeIndirectLogic'],
    },
    {
      tool: 'askAthena',
      description: 'Send prompt to Athena model and get response',
      params: ['prompt', 'options'],
    },
  ];
}

async function shutdown() {
  try {
    await contextService.close();
    return { shutdown: true, timestamp: Date.now() };
  } catch (err) {
    throw new AppError('Failed to shutdown MCP', 500, true, { raw: err });
  }
}

module.exports = {
  initialize,
  execute,
  getStatus,
  listCommands,
  shutdown,
};
