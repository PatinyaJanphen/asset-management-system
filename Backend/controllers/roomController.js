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
    const { id } = req.params
    const { code, name, description } = req.body
    if (!code || !name || !description) return res.json({ success: false, message: "All fields are required" })

    try {
        const existingRoom = await prisma.room.findUnique({ where: { id: BigInt(id) } })
        if (!existingRoom) return res.json({ success: false, message: "Room not found" })

        const codeExists = await prisma.room.findFirst({
            where: {
                code: code,
                NOT: { id: BigInt(id) }
            }
        })
        if (codeExists) return res.json({ success: false, message: "Room code already exists" })

        const updatedRoom = await prisma.room.update({
            where: { id: BigInt(id) },
            data: {
                code, name, description
            }
        })

        return res.json({
            success: true, message: "Update room successful",
            data: {
                id: Number(updatedRoom.id),
                code: updatedRoom.code,
                name: updatedRoom.name,
                description: updatedRoom.description
            }
        })
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
        const { id } = req.params
        if (!id) return res.json({ success: false, message: "Missing category ID" })

        const rooms = await prisma.room.findUnique({ where: { id: id } })
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