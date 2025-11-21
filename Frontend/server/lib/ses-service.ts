import {
  SendEmailCommand,
  GetIdentityVerificationAttributesCommand,
  VerifyEmailIdentityCommand,
} from "@aws-sdk/client-ses";
import { sesClient, SES_CONFIG } from "./aws-clients.js";

export interface EmailPreferences {
  alerts: boolean;
  reports: boolean;
  weeklySummary: boolean;
  email: string;
}

/**
 * Send email via SES
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  isHtml: boolean = true
): Promise<void> {
  try {
    const command = new SendEmailCommand({
      Source: SES_CONFIG.FromEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: isHtml
          ? {
              Html: {
                Data: body,
                Charset: "UTF-8",
              },
            }
          : {
              Text: {
                Data: body,
                Charset: "UTF-8",
              },
            },
      },
    });

    await sesClient.send(command);
  } catch (error: any) {
    throw new Error(`Failed to send email: ${error.message || "Unknown error"}`);
  }
}

/**
 * Send alert notification email
 */
export async function sendAlertNotification(
  email: string,
  alert: {
    deviceId: string;
    type: string;
    severity: string;
    message: string;
    timestamp: Date;
  }
): Promise<void> {
  const subject = `🚨 IoT Alert: ${alert.severity} - ${alert.type}`;
  const body = `
    <html>
      <body>
        <h2>IoT Security Alert</h2>
        <p><strong>Device:</strong> ${alert.deviceId}</p>
        <p><strong>Type:</strong> ${alert.type}</p>
        <p><strong>Severity:</strong> ${alert.severity}</p>
        <p><strong>Message:</strong> ${alert.message}</p>
        <p><strong>Time:</strong> ${alert.timestamp.toLocaleString()}</p>
      </body>
    </html>
  `;

  await sendEmail(email, subject, body);
}

/**
 * Send report notification email
 */
export async function sendReportNotification(
  email: string,
  reportName: string,
  downloadUrl: string
): Promise<void> {
  const subject = `📊 IoT Report Ready: ${reportName}`;
  const body = `
    <html>
      <body>
        <h2>Your IoT Report is Ready</h2>
        <p>Report: <strong>${reportName}</strong></p>
        <p><a href="${downloadUrl}">Download Report</a></p>
        <p><small>This link will expire in 24 hours.</small></p>
      </body>
    </html>
  `;

  await sendEmail(email, subject, body);
}

/**
 * Verify email identity (for SES sandbox mode)
 */
export async function verifyEmailIdentity(email: string): Promise<void> {
  try {
    const command = new VerifyEmailIdentityCommand({
      EmailAddress: email,
    });

    await sesClient.send(command);
  } catch (error: any) {
    throw new Error(`Failed to verify email: ${error.message || "Unknown error"}`);
  }
}

