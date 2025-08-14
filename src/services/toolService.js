const axios = require('axios');
const { AppError } = require('../utils/error');
const FormData = require('form-data');
const fs = require('fs');

// Athena configs
const ATHENA_API_URL = process.env.ATHENA_API_URL;
const ATHENA_API_KEY = process.env.ATHENA_API_KEY;

// Moad configs
const MOAD_API_URL = process.env.MOAD_API_URL;
const MOAD_API_KEY = process.env.MOAD_API_KEY;

async function athena(params, options = {}) {
  try {
    if (!ATHENA_API_URL || !ATHENA_API_KEY) {
      throw new AppError('Athena API URL or API key not configured', 500);
    }

    const baseUrl = process.env.ATHENA_API_URL;

    if (params.prompt) {
      if (!params || typeof params.prompt !== 'string') {
        throw new AppError('Prompt must be a non-empty string', 400);
      }

      const prompt = params.prompt;
      const url = `${baseUrl}/query`;
      const response = await axios.post(
        url,
        { prompt, options },
        {
          headers: {
            'x-api-key': process.env.ATHENA_API_KEY,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      if (!response.data) {
        throw new AppError('Invalid response from Athena API', 502);
      }

      return {
        response: response.data?.data?.answer,
        model: response.data.model || 'Athena',
      };

    } else if (params.upload) {
      // CREATE FORMDATA INSIDE THE FUNCTION (not globally)
      const formData = new FormData();
      
      // Convert file path to readable stream for Multer
      if (params.upload.file) {
        if (!fs.existsSync(params.upload.file)) {
          throw new AppError(`File not found: ${params.upload.file}`, 400);
        }
        formData.append('file', fs.createReadStream(params.upload.file));
      } else {
        throw new AppError('File path is required for upload', 400);
      }
      
      // Add required fields
      formData.append('source_type', params.upload.source_type || 'document');
      formData.append('title', params.upload.title || 'Untitled');
      
      // Add optional fields
      if (params.upload.description) {
        formData.append('description', params.upload.description);
      }
      if (params.upload.tags) {
        formData.append('tags', params.upload.tags);
      }

      const url = `${baseUrl}/ingest`;
      const response = await axios.post(url, formData, {
        headers: {
          'x-api-key': process.env.ATHENA_API_KEY,
          ...formData.getHeaders(), // This sets proper multipart headers
        },
        timeout: 30000, // Increased timeout for file uploads
      });

      if (!response.data) {
        throw new AppError('Invalid response from Athena API', 502);
      }

      return {
        response: response.data?.data?.answer || response.data?.message,
        model: response.data.model || 'Athena',
      };
      
    } else {
      throw new AppError('Either prompt or upload parameter is required', 400);
    }
    
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
      console.log('Failed to call Athena API:', err);
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
