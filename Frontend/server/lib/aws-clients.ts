import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";

// AWS Region configuration
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

// Cognito Client
export const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined, // Use IAM role if credentials not provided
});

// S3 Client
export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

// SES Client
export const sesClient = new SESClient({
  region: AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
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

