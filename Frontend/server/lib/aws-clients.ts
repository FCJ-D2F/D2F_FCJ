import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";

// Resolve region and credentials (prefer APP_* vars set in Lambda env)
const AWS_REGION =
  process.env.APP_AWS_REGION ||
  process.env.APP_AWS_DEFAULT_REGION ||
  process.env.AWS_REGION ||
  "ap-southeast-1";

const ACCESS_KEY_ID =
  process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY =
  process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

const SHARED_CREDS =
  ACCESS_KEY_ID && SECRET_ACCESS_KEY
    ? { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY }
    : undefined; // Fallback to Lambda role if not provided

// Cognito Client
export const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_REGION,
  credentials: SHARED_CREDS,
});

// S3 Client
export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: SHARED_CREDS,
});

// SES Client
export const sesClient = new SESClient({
  region: AWS_REGION,
  credentials: SHARED_CREDS,
});

// Cognito User Pool configuration
export const COGNITO_CONFIG = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID || "",
  ClientId: process.env.COGNITO_CLIENT_ID || "",
};

// S3 Bucket configuration
export const S3_CONFIG = {
  Bucket: process.env.S3_BUCKET_NAME || "iot-reports-bucket",
  ReportsPrefix: "reports/",
};

// SES configuration
export const SES_CONFIG = {
  FromEmail: process.env.SES_FROM_EMAIL || "noreply@iot-monitor.com",
  Region: AWS_REGION,
};

