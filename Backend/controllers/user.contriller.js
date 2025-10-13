import { prisma } from '../config/databaseconnect.js';

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } })
        if (!user) return res.json({ success: false, message: "User not foind" })

        res.json({
            success: true,
            message: "User data fetched successfully",
            userData: {
                id: user.id = Number(user.id),
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