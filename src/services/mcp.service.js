const { AppError } = require('../utils/error');
const contextService = require('./context.service');
const athenaService = require('./athena.service');

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

async function logRequest({ userId, apiKey, prompt, response }) {
  await requestLogModel.createRequestLog({
    user_id: userId,
    api_key: apiKey,
    prompt,
    response,
    created_at: new Date(),
  });
}

async function getContext(userId) {
  return await contextLogModel.getContextLog(userId);
}

async function saveContext(userId, context) {
  await contextLogModel.saveContextLog(userId, context);
}

async function execute(command, params, apiKey, userId) {
  try {
    // Validate API key first
    await validateApiKey(apiKey);

    let result;

    switch (command) {
      case 'generateDocs':
        if (!params.projectPath || !params.outputDir) {
          throw new AppError(
            'Missing required params for generateDocs: projectPath, outputDir',
            400
          );
        }
        result = {
          message: 'Documentation generation started',
          projectPath: params.projectPath,
          outputDir: params.outputDir,
          includeIndirectLogic: !!params.includeIndirectLogic,
        };
        break;

      case 'askAthena':
        if (!params.prompt) {
          throw new AppError('Missing prompt for Athena', 400);
        }

        // Get previous context if any
        const existingContext = await getContext(userId);
        const fullPrompt = existingContext
          ? existingContext + '\n' + params.prompt
          : params.prompt;

        // Call Athena service
        const athenaResponse = await athenaService.ask(fullPrompt, params.options || {});

        // Save updated context
        const updatedContext =
          (existingContext || '') +
          '\nUser: ' +
          params.prompt +
          '\nAthena: ' +
          athenaResponse.response;
        await saveContext(userId, updatedContext);

        // Log request
        await logRequest({
          userId,
          apiKey,
          prompt: params.prompt,
          response: athenaResponse.response,
        });

        result = athenaResponse;
        break;

      default:
        throw new AppError(`Unknown MCP command: ${command}`, 400);
    }

    // Increment usage count only after successful execution
    await incrementUsageCount(apiKey);

    return result;
  } catch (err) {
    console.log(err);
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
      command: 'generateDocs',
      description: 'Generate documentation for project source code',
      params: ['projectPath', 'outputDir', 'includeIndirectLogic'],
    },
    {
      command: 'askAthena',
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
