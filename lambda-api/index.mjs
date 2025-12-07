// Lambda function wrapper for Express backend
// NOTE: This file should be in the same directory as the compiled server code
// After building TypeScript, copy server/ folder to lambda-api/server/

// Map custom env vars (non-reserved) to AWS SDK expected keys
process.env.AWS_ACCESS_KEY_ID = process.env.APP_AWS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY = process.env.APP_AWS_SECRET_ACCESS_KEY;
process.env.AWS_REGION = process.env.APP_AWS_REGION || 'ap-southeast-1';

import serverless from 'serverless-http';
import { createServer } from './server/index.js';

// Create Express app
const app = createServer();

// Wrap Express app with serverless-http
export const handler = serverless(app, {
  binary: ['image/*', 'application/pdf'],
});

