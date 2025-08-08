// src/services/athena.service.js

const axios = require('axios');
const { AppError } = require('../utils/error');

const ATHENA_API_URL = process.env.ATHENA_API_URL;
const ATHENA_API_KEY = process.env.ATHENA_API_KEY;

async function ask(prompt, options = {}) {
  try {
    if (!prompt || typeof prompt !== 'string') {
      throw new AppError('Prompt must be a non-empty string', 400);
    }

    if (!ATHENA_API_URL || !ATHENA_API_KEY) {
      throw new AppError('Athena API URL or API key not configured', 500);
    }

    const payload = {
      prompt,
      options,
    };

    const response = await axios.post(
      ATHENA_API_URL,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${ATHENA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 seconds timeout
      }
    );

    if (
      !response.data ||
      typeof response.data.answer !== 'string'
    ) {
      throw new AppError('Invalid response from Athena API', 502);
    }

    return {
      response: response.data.answer,
      model: response.data.model || 'Athena',
      raw: response.data,
    };
  } catch (err) {
    if (err.response) {
      // Axios error with HTTP response from Athena
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

module.exports = {
  ask,
};
