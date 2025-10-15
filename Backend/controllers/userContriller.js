import { prisma } from '../config/databaseconnect.js';

export const getUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } })
        if (!user) return res.json({ success: false, message: "User not found" })

        res.json({
            success: true,
            message: "User data fetched successfully",
            userData: {
                id: Number(user.id),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isAccountVerified: user.isAccountVerified,
            }
        })
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message })
    }
}

export const updateUser = async (req, res) => {
    try {
        const { userId, firstname, lastname, phone } = req.body
        const currentUser = req.user

        const targetUserId = userId || currentUser.id

        if (currentUser.role !== 'ADMIN' && currentUser.id !== Number(targetUserId)) {
            return res.json({ success: false, message: "Permission denied" })
        }

        const user = await prisma.user.findUnique({ where: { id: targetUserId } })
        if (!user) return res.json({ success: false, message: "User not found" })

        await prisma.user.update({
            where: { id: BigInt(targetUserId) },
            data: { firstname: firstname, lastname: lastname, phone: phone }
        })
        return res.json({ success: true, message: "Update user data successful" });
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message })
    }
}

export const getAllUser = async (req, res) => {
    try {
        const allUser = await prisma.user.findMany()

        res.json({
            success: true,
            message: "All user data fetched successfully",
            userData: allUser.map(u => ({
                id: Number(u.id),
                firstname: u.firstname,
                lastname: u.lastname,
                email: u.email,
                phone: u.phone,
                role: u.role,
                isAccountVerified: u.isAccountVerified,
            }))
        })
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message })
    }
}

export const activate = async (req, res) => {
    try {
        const { userId, isActive } = req.body
        const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } })

        await prisma.user.update({
            where: { id: BigInt(userId) },
            data: { is_active: isActive }
        })

        return res.json({ success: true, message: "Update user is activate successfully" })
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message })
    }
}