import { prisma } from '../config/databaseconnect.js';

export const createRoom = async (req, res) => {
    const { code, name, description } = req.body
    if (!code || !name || !description) return res.json({ success: false, message: "All fields are required" })

    try {
        const existingRoomCode = await prisma.room.findUnique({ where: { code } })
        if (existingRoomCode) return res.json({ success: false, message: "Room code already exists" })

        const newRoom = await prisma.room.create({ data: { code, name, description } })

        return res.json({ success: true, message: "Create new room successful" })
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message })
    }
}

export const updateRoom = async (req, res) => {
    const { roomId, code, name, description } = req.body
    if (!roomId || !code || !name || !description) return res.json({ success: false, message: "All fields are required" })

    try {
        const existingRoom = await prisma.room.findUnique({ where: { code, NOT: { id: BigInt(roomId) } } })
        if (existingRoom) return res.json({ success: false, message: "Room code already exists" })

        const updateRoom = await prisma.room.update({
            where: { id: BigInt(roomId) },
            data: {
                code, name, description
            }
        })

        return res.json({ success: true, message: "Update room successful" })
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message })
    }
}

export const getAllRoom = async (req, res) => {
    try {
        const rooms = await prisma.room.findMany()

        res.json({
            success: true,
            message: "All room data fetched successfully",
            data: rooms.map(r => ({
                id: Number(r.id),
                code: r.code,
                name: r.name,
                description: r.description
            }))
        })
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message })
    }
}

export const getRoom = async (req, res) => {
    try {
        const { roomId, code } = req.body
        const rooms = await prisma.room.findUnique({ where: { code: code } })
        if (!rooms) return res.json({ success: false, message: "Room not found" })

        res.json({
            success: true,
            message: "Get room data fetched successfully",
            data: {
                id: Number(rooms.id),
                code: rooms.code,
                name: rooms.name,
                description: rooms.description
            }
        })
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message })
    }
}