// src/services/tool.service.js
const axios = require('axios');
const { AppError } = require('../utils/error');

// Athena configs
const ATHENA_API_URL = process.env.ATHENA_API_URL;
const ATHENA_API_KEY = process.env.ATHENA_API_KEY;

// Moad configs
const MOAD_API_URL = process.env.MOAD_API_URL;
const MOAD_API_KEY = process.env.MOAD_API_KEY;

async function athena(prompt, options = {}) {
  try {
    if (!prompt || typeof prompt !== 'string') {
      throw new AppError('Prompt must be a non-empty string', 400);
    }

    if (!ATHENA_API_URL || !ATHENA_API_KEY) {
      throw new AppError('Athena API URL or API key not configured', 500);
    }

    const response = await axios.post(
      ATHENA_API_URL,
      { prompt, options },
      {
        headers: {
          'Authorization': `Bearer ${ATHENA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    if (!response.data || typeof response.data.answer !== 'string') {
      throw new AppError('Invalid response from Athena API', 502);
    }

    return {
      response: response.data.answer,
      model: response.data.model || 'Athena',
      raw: response.data,
    };
  } catch (err) {
    if (err.response) {
      throw new AppError(
        `Athena API error: ${err.response.status} ${err.response.statusText}`,
        err.response.status,
        true,
        { raw: err.response.data }
      );
    }
    if (!(err instanceof AppError)) {
      throw new AppError('Failed to call Athena API', 500, true, { raw: err });
    }
    throw err;
  }
}

async function moad(projectPath, outputPath) {
  try {
    if (!projectPath || !outputPath) {
      throw new AppError('Missing required parameters for Moad', 400);
    }

    if (!MOAD_API_URL || !MOAD_API_KEY) {
      throw new AppError('Moad API URL or API key not configured', 500);
    }

    const response = await axios.post(
      MOAD_API_URL,
      { projectPath, outputPath },
      {
        headers: {
          'x-api-key': MOAD_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // Moad might take longer for docs generation
      }
    );

    if (!response.data || typeof response.data.message !== 'string') {
      throw new AppError('Invalid response from Moad API', 502);
    }

    return {
      response: response.data.message,
      raw: response.data,
    };
  } catch (err) {
    if (err.response) {
      throw new AppError(
        `Moad API error: ${err.response.status} ${err.response.statusText}`,
        err.response.status,
        true,
        { raw: err.response.data }
      );
    }
    if (!(err instanceof AppError)) {
      throw new AppError('Failed to call Moad API', 500, true, { raw: err });
    }
    throw err;
  }
}

module.exports = {
  athena,
  moad,
};
