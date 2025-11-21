import { RequestHandler } from "express";
import {
  signIn,
  signUp,
  confirmSignUp,
  refreshToken,
  getUserInfo,
  forgotPassword,
  confirmForgotPassword,
} from "../lib/cognito-auth.js";

export interface AuthRequest {
  email: string;
  password: string;
}

export interface SignUpRequest extends AuthRequest {
  attributes?: Record<string, string>;
}

export interface ConfirmSignUpRequest {
  email: string;
  code: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ConfirmForgotPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

/**
 * POST /api/auth/login
 * Sign in with email and password
 */
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as AuthRequest;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await signIn(email, password);
    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || "Authentication failed",
    });
  }
};

/**
 * POST /api/auth/register
 * Sign up new user
 */
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { email, password, attributes } = req.body as SignUpRequest;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await signUp(email, password, attributes);
    res.json({
      success: true,
      userSub: result.UserSub,
      message: "User registered successfully. Please check your email for verification code.",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || "Registration failed",
    });
  }
};

/**
 * POST /api/auth/confirm
 * Confirm sign up with verification code
 */
export const handleConfirmSignUp: RequestHandler = async (req, res) => {
  try {
    const { email, code } = req.body as ConfirmSignUpRequest;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    await confirmSignUp(email, code);
    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || "Verification failed",
    });
  }
};

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
export const handleRefreshToken: RequestHandler = async (req, res) => {
  try {
    const { refreshToken: token } = req.body as RefreshTokenRequest;

    if (!token) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const result = await refreshToken(token);
    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || "Token refresh failed",
    });
  }
};

/**
 * GET /api/auth/me
 * Get current user info
 */
export const handleGetUser: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const accessToken = authHeader.substring(7);
    const userInfo = await getUserInfo(accessToken);
    res.json({
      success: true,
      user: userInfo,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || "Failed to get user info",
    });
  }
};

/**
 * POST /api/auth/forgot-password
 * Send password reset code
 */
export const handleForgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body as ForgotPasswordRequest;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    await forgotPassword(email);
    res.json({
      success: true,
      message: "Password reset code sent to your email",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to send reset code",
    });
  }
};

/**
 * POST /api/auth/reset-password
 * Confirm password reset with code
 */
export const handleResetPassword: RequestHandler = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body as ConfirmForgotPasswordRequest;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: "Email, code, and new password are required" });
    }

    await confirmForgotPassword(email, code, newPassword);
    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || "Password reset failed",
    });
  }
};

