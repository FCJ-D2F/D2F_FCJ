import { signIn, signUp, confirmSignUp, refreshToken, getUserInfo, forgotPassword, confirmForgotPassword, } from "../lib/cognito-auth.js";
/**
 * POST /api/auth/login
 * Sign in with email and password
 */
export const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const result = await signIn(email, password);
        res.json({
            success: true,
            ...result,
        });
    }
    catch (error) {
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
export const handleRegister = async (req, res) => {
    try {
        const { email, password, attributes } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required"
            });
        }
        console.log('Registering user:', email);
        const result = await signUp(email, password, attributes);
        res.json({
            success: true,
            userSub: result.UserSub,
            message: "User registered successfully. Please check your email for verification code.",
        });
    }
    catch (error) {
        console.error('Registration error:', error);
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
export const handleConfirmSignUp = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ error: "Email and code are required" });
        }
        await confirmSignUp(email, code);
        res.json({
            success: true,
            message: "Email verified successfully",
        });
    }
    catch (error) {
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
export const handleRefreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            return res.status(400).json({ error: "Refresh token is required" });
        }
        const result = await refreshToken(token);
        res.json({
            success: true,
            ...result,
        });
    }
    catch (error) {
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
export const handleGetUser = async (req, res) => {
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
    }
    catch (error) {
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
export const handleForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        await forgotPassword(email);
        res.json({
            success: true,
            message: "Password reset code sent to your email",
        });
    }
    catch (error) {
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
export const handleResetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: "Email, code, and new password are required" });
        }
        await confirmForgotPassword(email, code, newPassword);
        res.json({
            success: true,
            message: "Password reset successfully",
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || "Password reset failed",
        });
    }
};
