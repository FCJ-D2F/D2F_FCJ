// Lambda function wrapper for Express backend
// NOTE: This file should be in the same directory as the compiled server code
// After building TypeScript, copy server/ folder to lambda-api/server/
import serverless from 'serverless-http';
import { createServer } from './server/index.js';

// Create Express app
const app = createServer();

// Wrap Express app with serverless-http
export const handler = serverless(app, {
  binary: ['image/*', 'application/pdf'],
});

