import { listReports, getReportDownloadUrl, uploadReport, deleteReport } from "../lib/s3-service.js";
import { sendReportNotification } from "../lib/ses-service.js";
import { getUserInfo } from "../lib/cognito-auth.js";
/**
 * GET /api/reports
 * List all reports from S3
 */
export const handleListReports = async (req, res) => {
    try {
        const reports = await listReports();
        res.json({
            success: true,
            reports,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to list reports",
            reports: [],
        });
    }
};
/**
 * GET /api/reports/:id/download
 * Get presigned URL for downloading a report
 */
export const handleDownloadReport = async (req, res) => {
    try {
        const { id } = req.params;
        // id is the S3 key
        const downloadUrl = await getReportDownloadUrl(id, 3600); // 1 hour expiry
        res.json({
            success: true,
            downloadUrl,
            expiresIn: 3600,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to generate download URL",
        });
    }
};
/**
 * POST /api/reports/generate
 * Generate and upload a new report
 */
export const handleGenerateReport = async (req, res) => {
    try {
        const { deviceId, startTime, endTime, type = "summary" } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authorization required" });
        }
        const accessToken = authHeader.substring(7);
        const userInfo = await getUserInfo(accessToken);
        // Generate report data (this would typically call Lambda to aggregate data)
        const reportData = {
            deviceId: deviceId || "all",
            startTime: startTime || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: endTime || new Date().toISOString(),
            type,
            generatedAt: new Date().toISOString(),
            generatedBy: userInfo.email,
            summary: {
                totalReadings: 0,
                averageTemperature: 0,
                averageGas: 0,
                averageHumidity: 0,
                alertsCount: 0,
            },
        };
        // Upload to S3
        const reportKey = `report-${Date.now()}-${deviceId || "all"}.json`;
        await uploadReport(reportKey, JSON.stringify(reportData, null, 2), "application/json");
        // Get download URL
        const downloadUrl = await getReportDownloadUrl(`reports/${reportKey}`, 86400); // 24 hours
        // Send notification email
        try {
            await sendReportNotification(userInfo.email, reportKey, downloadUrl);
        }
        catch (emailError) {
            console.warn("Failed to send report notification email:", emailError);
            // Don't fail the request if email fails
        }
        res.json({
            success: true,
            report: {
                key: `reports/${reportKey}`,
                name: reportKey,
                downloadUrl,
                generatedAt: reportData.generatedAt,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to generate report",
        });
    }
};
/**
 * DELETE /api/reports/:id
 * Delete a report from S3
 */
export const handleDeleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteReport(id);
        res.json({
            success: true,
            message: "Report deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to delete report",
        });
    }
};
