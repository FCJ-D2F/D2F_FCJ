import { SendEmailCommand, VerifyEmailIdentityCommand, } from "@aws-sdk/client-ses";
import { sesClient, SES_CONFIG } from "./aws-clients.js";
/**
 * Send email via SES
 */
export async function sendEmail(to, subject, body, isHtml = true) {
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
    }
    catch (error) {
        throw new Error(`Failed to send email: ${error.message || "Unknown error"}`);
    }
}
/**
 * Send alert notification email
 */
export async function sendAlertNotification(email, alert) {
    const subject = `🚨 Alert Notification: ${alert.severity} - ${alert.type}`;
    const body = `
    <html>
      <body>
        <h2>IoT Alert Notification</h2>
        <p><strong>Device:</strong> ${alert.deviceId}</p>
        <p><strong>Type:</strong> ${alert.type}</p>
        <p><strong>Severity:</strong> ${alert.severity}</p>
        <p><strong>Message:</strong> ${alert.message}</p>
        <p><strong>Time:</strong> ${alert.timestamp.toLocaleString()}</p>
        <hr />
        <p><strong>Temperature:</strong> ${alert.temperature ?? "-"}°C</p>
        <p><strong>Gas:</strong> ${alert.gas ?? "-"}</p>
        <p><strong>Humidity:</strong> ${alert.humidity ?? "-"}%</p>
        <p><strong>Flame:</strong> ${alert.flame ? "YES" : "NO"}</p>
        <p><strong>Danger:</strong> ${alert.danger ? "YES" : "NO"}</p>
      </body>
    </html>
  `;
    await sendEmail(email, subject, body);
}
/**
 * Send report notification email
 */
export async function sendReportNotification(email, reportName, downloadUrl) {
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
export async function verifyEmailIdentity(email) {
    try {
        const command = new VerifyEmailIdentityCommand({
            EmailAddress: email,
        });
        await sesClient.send(command);
    }
    catch (error) {
        throw new Error(`Failed to verify email: ${error.message || "Unknown error"}`);
    }
}
