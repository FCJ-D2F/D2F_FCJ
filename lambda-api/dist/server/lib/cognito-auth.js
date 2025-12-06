import { InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand, GetUserCommand, } from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";
import { cognitoClient, COGNITO_CONFIG } from "./aws-clients.js";
// Optional Cognito App Client secret
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;
/**
 * Compute SECRET_HASH for Cognito when App Client has a client secret configured.
 * If no client secret is provided, returns undefined and Cognito will work
 * with public (no-secret) app clients.
 */
function getSecretHash(username) {
    if (!CLIENT_SECRET || !COGNITO_CONFIG.ClientId)
        return undefined;
    const hmac = crypto.createHmac("sha256", CLIENT_SECRET);
    hmac.update(username + COGNITO_CONFIG.ClientId);
    return hmac.digest("base64");
}
/**
 * Sign in user with email and password
 */
export async function signIn(email, password) {
    try {
        const authParams = {
            USERNAME: email,
            PASSWORD: password,
        };
        const secretHash = getSecretHash(email);
        if (secretHash) {
            authParams.SECRET_HASH = secretHash;
        }
        const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: COGNITO_CONFIG.ClientId,
            AuthParameters: authParams,
        });
        const response = await cognitoClient.send(command);
        return {
            AccessToken: response.AuthenticationResult?.AccessToken,
            IdToken: response.AuthenticationResult?.IdToken,
            RefreshToken: response.AuthenticationResult?.RefreshToken,
            ExpiresIn: response.AuthenticationResult?.ExpiresIn,
        };
    }
    catch (error) {
        throw new Error(`Sign in failed: ${error.message || "Unknown error"}`);
    }
}
/**
 * Sign up new user
 */
export async function signUp(email, password, attributes) {
    try {
        const command = new SignUpCommand({
            ClientId: COGNITO_CONFIG.ClientId,
            Username: email,
            Password: password,
            SecretHash: getSecretHash(email),
            UserAttributes: [
                { Name: "email", Value: email },
                ...Object.entries(attributes || {}).map(([key, value]) => ({
                    Name: key,
                    Value: value,
                })),
            ],
        });
        const response = await cognitoClient.send(command);
        return { UserSub: response.UserSub || "" };
    }
    catch (error) {
        throw new Error(`Sign up failed: ${error.message || "Unknown error"}`);
    }
}
/**
 * Confirm sign up with verification code
 */
export async function confirmSignUp(email, code) {
    try {
        const command = new ConfirmSignUpCommand({
            ClientId: COGNITO_CONFIG.ClientId,
            Username: email,
            ConfirmationCode: code,
            SecretHash: getSecretHash(email),
        });
        await cognitoClient.send(command);
    }
    catch (error) {
        throw new Error(`Confirm sign up failed: ${error.message || "Unknown error"}`);
    }
}
/**
 * Refresh access token
 */
export async function refreshToken(refreshToken) {
    try {
        const authParams = {
            REFRESH_TOKEN: refreshToken,
        };
        // For confidential clients, REFRESH_TOKEN_AUTH may also require SECRET_HASH
        // using the original username as part of the hash. In many cases, Cognito
        // accepts just the refresh token + client secret. If needed, you can extend
        // this to include USERNAME as well.
        if (CLIENT_SECRET) {
            // Using refresh token itself as username surrogate for hash
            authParams.SECRET_HASH = getSecretHash(refreshToken);
        }
        const command = new InitiateAuthCommand({
            AuthFlow: "REFRESH_TOKEN_AUTH",
            ClientId: COGNITO_CONFIG.ClientId,
            AuthParameters: authParams,
        });
        const response = await cognitoClient.send(command);
        return {
            AccessToken: response.AuthenticationResult?.AccessToken,
            IdToken: response.AuthenticationResult?.IdToken,
            ExpiresIn: response.AuthenticationResult?.ExpiresIn,
        };
    }
    catch (error) {
        throw new Error(`Refresh token failed: ${error.message || "Unknown error"}`);
    }
}
/**
 * Get user info from access token
 */
export async function getUserInfo(accessToken) {
    try {
        const command = new GetUserCommand({
            AccessToken: accessToken,
        });
        const response = await cognitoClient.send(command);
        const emailAttr = response.UserAttributes?.find(attr => attr.Name === "email");
        const emailVerifiedAttr = response.UserAttributes?.find(attr => attr.Name === "email_verified");
        return {
            sub: response.Username || "",
            email: emailAttr?.Value || "",
            email_verified: emailVerifiedAttr?.Value === "true",
            username: response.Username || "",
        };
    }
    catch (error) {
        throw new Error(`Get user info failed: ${error.message || "Unknown error"}`);
    }
}
/**
 * Forgot password - send verification code
 */
export async function forgotPassword(email) {
    try {
        const command = new ForgotPasswordCommand({
            ClientId: COGNITO_CONFIG.ClientId,
            Username: email,
            SecretHash: getSecretHash(email),
        });
        await cognitoClient.send(command);
    }
    catch (error) {
        throw new Error(`Forgot password failed: ${error.message || "Unknown error"}`);
    }
}
/**
 * Confirm forgot password with verification code
 */
export async function confirmForgotPassword(email, code, newPassword) {
    try {
        const command = new ConfirmForgotPasswordCommand({
            ClientId: COGNITO_CONFIG.ClientId,
            Username: email,
            ConfirmationCode: code,
            Password: newPassword,
            SecretHash: getSecretHash(email),
        });
        await cognitoClient.send(command);
    }
    catch (error) {
        throw new Error(`Confirm forgot password failed: ${error.message || "Unknown error"}`);
    }
}
/**
 * Sign out (client-side only, Cognito doesn't have server-side sign out)
 */
export function signOut() {
    // Cognito sign out is handled client-side by clearing tokens
    // This is just a placeholder for consistency
}
