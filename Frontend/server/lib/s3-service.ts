import {
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client, S3_CONFIG } from "./aws-clients.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface Report {
  key: string;
  name: string;
  size: number;
  lastModified: Date;
  url?: string;
}

/**
 * List all reports from S3
 */
export async function listReports(): Promise<Report[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: S3_CONFIG.Bucket,
      Prefix: S3_CONFIG.ReportsPrefix,
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      return [];
    }

    return response.Contents.map((item) => ({
      key: item.Key || "",
      name: item.Key?.replace(S3_CONFIG.ReportsPrefix, "") || "",
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    }));
  } catch (error: any) {
    throw new Error(`Failed to list reports: ${error.message || "Unknown error"}`);
  }
}

/**
 * Get presigned URL for downloading a report
 */
export async function getReportDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_CONFIG.Bucket,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error: any) {
    throw new Error(`Failed to generate download URL: ${error.message || "Unknown error"}`);
  }
}

/**
 * Upload a report to S3
 */
export async function uploadReport(
  key: string,
  content: Buffer | string,
  contentType: string = "application/json"
): Promise<void> {
  try {
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.Bucket,
      Key: `${S3_CONFIG.ReportsPrefix}${key}`,
      Body: typeof content === "string" ? Buffer.from(content) : content,
      ContentType: contentType,
    });

    await s3Client.send(command);
  } catch (error: any) {
    throw new Error(`Failed to upload report: ${error.message || "Unknown error"}`);
  }
}

/**
 * Delete a report from S3
 */
export async function deleteReport(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_CONFIG.Bucket,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error: any) {
    throw new Error(`Failed to delete report: ${error.message || "Unknown error"}`);
  }
}

