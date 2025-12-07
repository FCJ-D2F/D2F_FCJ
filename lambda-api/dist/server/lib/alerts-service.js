// @ts-nocheck
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, } from "@aws-sdk/lib-dynamodb";
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ||
    process.env.DYNAMODB_TABLE ||
    "ESP32_data";
// Reuse region/creds from env (mapped in index.mjs)
const REGION = process.env.APP_AWS_REGION ||
    process.env.APP_AWS_DEFAULT_REGION ||
    process.env.AWS_REGION ||
    "ap-southeast-1";
const ACCESS_KEY_ID = process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const client = new DynamoDBClient({
    region: REGION,
    credentials: ACCESS_KEY_ID && SECRET_ACCESS_KEY
        ? { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY }
        : undefined,
});
const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
});
export async function listAlerts(limit = 50, deviceId) {
    // Simple scan + filter (accept numeric 1 or boolean true). Nếu cần tối ưu, thêm GSI cho alerts.
    const exprDevice = deviceId && deviceId !== "all" ? "#d = :device AND " : "";
    const cmd = new ScanCommand({
        TableName: TABLE_NAME,
        Limit: Number(limit),
        FilterExpression: `${exprDevice}(#flame = :one OR #flame = :true OR #danger = :one OR #danger = :true)`,
        ExpressionAttributeNames: {
            "#d": "deviceId",
            "#flame": "alert.flame",
            "#danger": "alert.danger",
        },
        ExpressionAttributeValues: {
            ":one": 1,
            ":true": true,
            ...(deviceId && deviceId !== "all" ? { ":device": deviceId } : {}),
        },
    });
    const resp = await docClient.send(cmd);
    const items = (resp.Items || []).map((it) => {
        const ts = Number(it.timestamp) || Date.now();
        return {
            id: `${it.deviceId || "unknown"}-${ts}`,
            deviceId: it.deviceId || "unknown",
            timestamp: ts,
            flame: Number(it.alert?.flame ?? 0),
            danger: Number(it.alert?.danger ?? 0),
            temperature: it.temperature ? Number(it.temperature) : undefined,
            gas: it.gas ? Number(it.gas) : undefined,
            humidity: it.humidity ? Number(it.humidity) : undefined,
        };
    });
    // Sort desc by timestamp and limit
    return items
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, Number(limit) || 50);
}
export async function getAlertStats(deviceId) {
    const alerts = await listAlerts(500, deviceId);
    const total = alerts.length;
    const bySeverity = {
        flame: alerts.filter((a) => a.flame === 1).length,
        danger: alerts.filter((a) => a.danger === 1).length,
    };
    const byDevice = {};
    alerts.forEach((a) => {
        byDevice[a.deviceId] = (byDevice[a.deviceId] || 0) + 1;
    });
    return { total, bySeverity, byDevice };
}
