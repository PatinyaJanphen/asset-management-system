import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import transporter from '../config/nodemailer.js';
import { prisma } from '../config/databaseconnect.js';
import { PASSWORD_RESET_TEMPLATE } from '../config/email.tmplates.js';

export const register = async (req, res) => {
    const { firstname, lastname, email, username, password } = req.body;

    if (!username || !email || !password || !firstname || !lastname) {
        return res.json({
            succeses: false,
            message: "All fields are required"
        });
    }

    try {
        // ตรวจสอบว่ามี user นี้อยู่แล้วหรือไม่
        const existingUser = await await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // เพิ่ม user ใหม่
        const newUser = await prisma.user.create({
            data: {
                firstname,
                lastname,
                email,
                username,
                password: hashedPassword,
                is_active: true,
            },
        });

        const userId = newUser.id.toString();

        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '12h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 12 * 60 * 60 * 1000
        })

        // send email to user for verify email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Verify your email',
            text: `Please verify your email id: ${email}`
        };

        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: "Rgistration succeses"
        })
    }
    catch (error) {
        res.json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.json({
            success: false,
            message: "Email and password are required"
        })
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.json({
                succeses: false,
                message: "Invalid email"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({
                success: false,
                message: "Invalid password"
            })
        }

        const userId = user.id.toString();

        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'default_jwt_secret', { expiresIn: '12h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 12 * 60 * 60 * 1000
        })

        return res.json({
            success: true,
            message: "Login succeses"
        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: "Login fail",
            error: error.message
        })
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({
            success: true,
            message: "Logout succeses",
        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: "Logout fail",
            error: error.message
        })
    }
};

// send otp to user for verify email
export const sendVerificationEmail = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (user.isAccountVerified) {
            return res.json({
                success: false,
                message: "Account already verified"
            })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = new Date(Date.now() + 10 * 60 * 1000); // OTP หมดอายุใน 10 นาที

        await prisma.user.update({
            where: { id: userId },
            data: {
                verifyOtp: user.verifyOtp,
                verifyOtpExpireAt: user.verifyOtpExpireAt
            }
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Verify your email',
            text: `Your OTP for email verification is ${otp}. It will expire in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: "Verification OTP sent to email"
        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: "Send email fail",
            error: error.message
        })
    }
}

// verify email with otp
export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.json({
            success: false,
            message: "Missing Details"
        })
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.json({
                succeses: false,
                message: "User not found"
            })
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({
                success: false,
                message: "Invalid OTP"
            })
        }

        if (user.verifyOtpExpireAt < new Date()) {
            return res.json({
                success: false,
                message: "OTP has expired"
            })
        }

        user.isAccountVerified = true;
        user.verifyOtp = null;
        user.verifyOtpExpireAt = null;

        await prisma.user.update({
            where: { id: userId },
            data: {
                isAccountVerified: user.isAccountVerified,
                verifyOtp: user.verifyOtp,
                verifyOtpExpireAt: user.verifyOtpExpireAt
            }
        });

        return res.json({
            success: true,
            message: "Email verified succeses"
        })
    } catch (err) {
        return res.json({
            success: false,
            message: "Verify email fail",
            error: err.message
        })
    }
}

// check user is authenticated
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({
            success: true,
            message: "User is authenticated",
        })
    } catch (error) {
        res.json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
}

// send reset password OTP
export const sendResetPasswordOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({
            success: false,
            message: "Email is required"
        })
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = new Date(Date.now() + 10 * 60 * 1000); // OTP หมดอายุใน 10 นาที

        await prisma.user.update({
            where: { email },
            data: {
                resetOtp: user.resetOtp,
                resetOtpExpireAt: user.resetOtpExpireAt
            }
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        };

        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: "Password Reset OTP sent to email"
        })

    } catch (error) {
        return res.json({
            succeses: false,
            success: "Send reset password OTP fail",
            error: error.message
        })
    }

}

// reset password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({
            success: false,
            message: "Email, OTP and new password are required"
        })
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            })
        }

        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({
                success: false,
                message: "Invalid OTP"
            })
        }

        if (user.resetOtpExpireAt < new Date()) {
            return res.json({
                success: false,
                message: "OTP has expired"
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = null;
        user.resetOtpExpireAt = null;

        await prisma.user.update({
            where: { email },
            data: {
                password: user.password,
                resetOtp: user.resetOtp,
                resetOtpExpireAt: user.resetOtpExpireAt
            }
        });

        return res.json({
            success: true,
            message: "Password reset succeses"
        })
    } catch (error) {
        return res.json({
            succeses: false,
            success: "Reset password fail",
            error: error.message
        })
    }
}