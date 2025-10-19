import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import transporter from '../config/nodemailer.js';
import { prisma } from '../config/databaseconnect.js';
import { PASSWORD_RESET_TEMPLATE } from '../config/emailTmplates.js';

export const register = async (req, res) => {
    const { firstname, lastname, email, username, password } = req.body;

    if (!firstname || !lastname || !email || !username || !password) {
        return res.json({ success: false, message: "All fields are required" });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.json({ success: false, message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                firstname,
                lastname,
                email,
                username,
                password: hashedPassword,
                is_active: true,
                isAccountVerified: false,
            },
        });

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "12h" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 12 * 60 * 60 * 1000,
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Create account successful",
            text: `Welcom to Asset-ss Hello: ${email}`,
        };
        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "Registration successful" });
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.json({ success: false, message: "Email and password are required" });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.json({ success: false, message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json({ success: false, message: "Invalid email or password" });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "12h" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 12 * 60 * 60 * 1000,
        });

        await prisma.user.update({
            where: { id: BigInt(user.id) },
            data: { lastlogin_at: new Date() },
        });

        return res.json({
            success: true,
            message: "Login successful",
            user: {
                id: Number(user.id),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });

        return res.json({ success: true, message: "Logout successful" });
    } catch (error) {
        return res.json({ success: false, message: "Logout failed", error: error.message });
    }
};

// Send Verification OTP
export const sendVerificationEmail = async (req, res) => {
    try {
        const userId = req.user.id; // Get userId from middleware
        const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } });
        if (!user) return res.json({ success: false, message: "User not found" });
        if (user.isAccountVerified) return res.json({ success: false, message: "Account already verified" });

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        await prisma.user.update({
            where: { id: BigInt(userId) },
            data: {
                verifyOtp: otp,
                verifyOtpExpireAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verify your email",
            text: `Your OTP for email verification is ${otp}. It will expire in 10 minutes.`,
        });

        return res.json({
            success: true,
            message: "Verification OTP sent to email"
        })
    }
    catch (error) {
        return res.json({ success: false, message: "Failed to send OTP", error: error.message });
    }
}

// verify email with otp
export const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const userId = req.user.id; // Get userId from middleware
    if (!otp) return res.json({ success: false, message: "OTP is required" });

    try {
        const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } });
        if (!user) return res.json({ success: false, message: "User not found" });

        if (!user.verifyOtp || user.verifyOtp !== otp) return res.json({ success: false, message: "Invalid OTP" });
        if (user.verifyOtpExpireAt < new Date()) return res.json({ success: false, message: "OTP has expired" });

        await prisma.user.update({
            where: { id: userId },
            data: { isAccountVerified: true, verifyOtp: null, verifyOtpExpireAt: null },
        });

        return res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        return res.json({ success: false, message: "Email verification failed", error: error.message });
    }
};

// check user is authenticated
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true, message: "User is authenticated", })
    } catch (error) {
        res.json({ success: false, message: "Server error", error: error.message })
    }
}

// send reset password OTP
export const sendResetPasswordOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.json({ success: false, message: "Email is required" });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.json({ success: false, message: "User not found" });

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        await prisma.user.update({
            where: { email },
            data: { resetOtp: otp, resetOtpExpireAt: new Date(Date.now() + 10 * 60 * 1000) },
        });

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Password Reset OTP",
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", email),
        });

        return res.json({ success: true, message: "Password reset OTP sent to email" });
    } catch (error) {
        return res.json({ success: false, message: "Failed to send reset OTP", error: error.message });
    }
};

// reset password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.json({ success: false, message: "Missing required fields" });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.json({ success: false, message: "User not found" });

        if (!user.resetOtp || user.resetOtp !== otp) return res.json({ success: false, message: "Invalid OTP" });
        if (user.resetOtpExpireAt < new Date()) return res.json({ success: false, message: "OTP has expired" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword, resetOtp: null, resetOtpExpireAt: null },
        });

        return res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        return res.json({ success: false, message: "Password reset failed", error: error.message });
    }
};

export const authenticate = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};