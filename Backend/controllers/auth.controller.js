import { prisma } from '../config/databaseconnect.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

        const userId = newUser.id;

        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '12h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 12 * 60 * 60 * 1000
        })

        return res.json({
            succeses: true,
            message: "Rgistration succeses"
        })
    }
    catch (err) {
        res.json({
            success: false,
            message: "Server error",
            error: err.message
        })
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.json({
            succeses: false,
            message: "Email and password are required"
        })
    }

    try {
        const db = await databaseconnect();
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
                succeses: false,
                message: "Invalid password"
            })
        }

        const userId = user.id;

        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '12h' });

        res.coolie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 12 * 60 * 60 * 1000
        })

        return res.json({
            succeses: true,
            message: "Login succeses"
        })
    }
    catch (err) {
        return res.json({
            succeses: false,
            message: "Login fail",
            error: err.message
        })
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 12 * 60 * 60 * 1000
        })

        return res.json({
            succeses: true,
            message: "Logout succeses",
        })
    }
    catch (err) {
        return res.json({
            succeses: false,
            message: "Logout fail",
            error: err.message
        })
    }
};