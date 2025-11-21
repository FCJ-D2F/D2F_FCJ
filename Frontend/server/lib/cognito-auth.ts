import {
  AdminInitiateAuthCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient, COGNITO_CONFIG } from "./aws-clients.js";

export interface AuthResult {
  AccessToken?: string;
  IdToken?: string;
  RefreshToken?: string;
  ExpiresIn?: number;
}

export interface UserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  username: string;
}

/**
 * Sign in user with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: COGNITO_CONFIG.ClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);
    return {
      AccessToken: response.AuthenticationResult?.AccessToken,
      IdToken: response.AuthenticationResult?.IdToken,
      RefreshToken: response.AuthenticationResult?.RefreshToken,
      ExpiresIn: response.AuthenticationResult?.ExpiresIn,
    };
  } catch (error: any) {
    throw new Error(`Sign in failed: ${error.message || "Unknown error"}`);
  }
}

/**
 * Sign up new user
 */
export async function signUp(email: string, password: string, attributes?: Record<string, string>): Promise<{ UserSub: string }> {
  try {
    const command = new SignUpCommand({
      ClientId: COGNITO_CONFIG.ClientId,
      Username: email,
      Password: password,
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
  } catch (error: any) {
    throw new Error(`Sign up failed: ${error.message || "Unknown error"}`);
  }
}

/**
 * Confirm sign up with verification code
 */
export async function confirmSignUp(email: string, code: string): Promise<void> {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: COGNITO_CONFIG.ClientId,
      Username: email,
      ConfirmationCode: code,
    });

    await cognitoClient.send(command);
  } catch (error: any) {
    throw new Error(`Confirm sign up failed: ${error.message || "Unknown error"}`);
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<AuthResult> {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: COGNITO_CONFIG.ClientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    const response = await cognitoClient.send(command);
    return {
      AccessToken: response.AuthenticationResult?.AccessToken,
      IdToken: response.AuthenticationResult?.IdToken,
      ExpiresIn: response.AuthenticationResult?.ExpiresIn,
    };
  } catch (error: any) {
    throw new Error(`Refresh token failed: ${error.message || "Unknown error"}`);
  }
}

/**
 * Get user info from access token
 */
export async function getUserInfo(accessToken: string): Promise<UserInfo> {
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
  } catch (error: any) {
    throw new Error(`Get user info failed: ${error.message || "Unknown error"}`);
  }
}

/**
 * Forgot password - send verification code
 */
export async function forgotPassword(email: string): Promise<void> {
  try {
    const command = new ForgotPasswordCommand({
      ClientId: COGNITO_CONFIG.ClientId,
      Username: email,
    });

    await cognitoClient.send(command);
  } catch (error: any) {
    throw new Error(`Forgot password failed: ${error.message || "Unknown error"}`);
  }
}

/**
 * Confirm forgot password with verification code
 */
export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  try {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: COGNITO_CONFIG.ClientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await cognitoClient.send(command);
  } catch (error: any) {
    throw new Error(`Confirm forgot password failed: ${error.message || "Unknown error"}`);
  }
}

/**
 * Sign out (client-side only, Cognito doesn't have server-side sign out)
 */
export function signOut(): void {
  // Cognito sign out is handled client-side by clearing tokens
  // This is just a placeholder for consistency
}

