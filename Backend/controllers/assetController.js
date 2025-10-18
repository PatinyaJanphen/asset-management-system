import { prisma } from "../config/databaseconnect.js";


//  Create Asset 
export const createAsset = async (req, res) => {
    const { code, name, description, serial_number, categoryId, roomId, ownerId, status, purchase_at, value, is_active } = req.body;

    if (!code || !name || !serial_number) {
        return res.json({ success: false, message: "รหัสและชื่อสินทรัพย์จำเป็นต้องกรอก" });
    }

    try {
        const existingAsset = await prisma.asset.findUnique({ where: { code } });
        if (existingAsset) return res.json({ success: false, message: "รหัสสินทรัพย์นี้มีอยู่แล้ว" });

        const existingSerial = await prisma.asset.findUnique({ where: { serial_number } });
        if (existingSerial) return res.json({ success: false, message: "หมายเลขซีเรียลนี้มีอยู่แล้ว" });

        const asset = await prisma.asset.create({
            data: {
                code,
                name,
                description,
                serial_number,
                categoryId: categoryId ? BigInt(categoryId) : null,
                roomId: roomId ? BigInt(roomId) : null,
                ownerId: ownerId ? BigInt(ownerId) : null,
                status: status || 'AVAILABLE',
                purchase_at: purchase_at ? new Date(purchase_at) : null,
                value: value ? parseFloat(value) : null,
                is_active: is_active !== undefined ? is_active : true,
                created_by: req.user?.id ? BigInt(req.user.id) : null
            },
            include: {
                category: true,
                room: true,
                owner: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            }
        });

        return res.json({
            success: true,
            message: "สร้างสินทรัพย์สำเร็จ",
            data: {
                id: asset.id.toString(),
                code: asset.code,
                name: asset.name,
                description: asset.description,
                serial_number: asset.serial_number,
                categoryId: asset.categoryId?.toString(),
                roomId: asset.roomId?.toString(),
                ownerId: asset.ownerId?.toString(),
                status: asset.status,
                purchase_at: asset.purchase_at,
                value: asset.value,
                is_active: asset.is_active,
                category: asset.category,
                room: asset.room,
                owner: asset.owner
            }
        });
    } catch (error) {
        console.error('Error creating asset:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการสร้างสินทรัพย์", error: error.message });
    }
};

//  Get All Assets 
export const getAllAssets = async (req, res) => {
    try {
        const assets = await prisma.asset.findMany({
            include: {
                category: true,
                room: true,
                owner: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return res.json({
            success: true,
            data: assets.map(asset => ({
                id: asset.id.toString(),
                code: asset.code,
                name: asset.name,
                description: asset.description,
                serial_number: asset.serial_number,
                status: asset.status,
                categoryId: asset.categoryId?.toString(),
                roomId: asset.roomId?.toString(),
                ownerId: asset.ownerId?.toString(),
                purchase_at: asset.purchase_at,
                value: asset.value,
                is_active: asset.is_active,
                created_at: asset.created_at,
                updated_at: asset.updated_at,
                category: asset.category,
                room: asset.room,
                owner: asset.owner
            }))
        });
    } catch (error) {
        console.error('Error fetching assets:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินทรัพย์", error: error.message });
    }
};

//  Get Asset By ID 
export const getAssetById = async (req, res) => {
    const { id } = req.params;

    try {
        const asset = await prisma.asset.findUnique({
            where: { id: BigInt(id) },
            include: {
                category: true,
                room: true,
                owner: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            }
        });

        if (!asset) return res.json({ success: false, message: "ไม่พบสินทรัพย์" });

        return res.json({
            success: true,
            data: {
                id: asset.id.toString(),
                code: asset.code,
                name: asset.name,
                description: asset.description,
                serial_number: asset.serial_number,
                status: asset.status,
                categoryId: asset.categoryId?.toString(),
                roomId: asset.roomId?.toString(),
                ownerId: asset.ownerId?.toString(),
                purchase_at: asset.purchase_at,
                value: asset.value,
                is_active: asset.is_active,
                created_at: asset.created_at,
                updated_at: asset.updated_at,
                category: asset.category,
                room: asset.room,
                owner: asset.owner
            }
        })
    } catch (error) {
        console.error('Error fetching asset:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินทรัพย์", error: error.message });
    }
};

//  Update Asset 
export const updateAsset = async (req, res) => {
    const { id } = req.params;
    const { code, name, description, serial_number, categoryId, roomId, ownerId, status, purchase_at, value, is_active } = req.body;

    try {
        const existingAsset = await prisma.asset.findUnique({ where: { id: BigInt(id) } });

        if (!existingAsset) {
            return res.json({ success: false, message: "ไม่พบสินทรัพย์" });
        }

        if (code && code !== existingAsset.code) {
            const duplicateCode = await prisma.asset.findUnique({ where: { code } });

            if (duplicateCode) return res.json({ success: false, message: "รหัสสินทรัพย์นี้มีอยู่แล้ว" });
        }

        if (serial_number && serial_number !== existingAsset.serial_number) {
            const duplicateSerial = await prisma.asset.findUnique({ where: { serial_number } });

            if (duplicateSerial) return res.json({ success: false, message: "หมายเลขซีเรียลนี้มีอยู่แล้ว" });
        }

        const asset = await prisma.asset.update({
            where: { id: BigInt(id) },
            data: {
                code: code || existingAsset.code,
                name: name || existingAsset.name,
                description: description !== undefined ? description : existingAsset.description,
                serial_number: serial_number !== undefined ? serial_number : existingAsset.serial_number,
                categoryId: categoryId ? BigInt(categoryId) : existingAsset.categoryId,
                roomId: roomId ? BigInt(roomId) : existingAsset.roomId,
                ownerId: ownerId ? BigInt(ownerId) : existingAsset.ownerId,
                status: status || existingAsset.status,
                purchase_at: purchase_at ? new Date(purchase_at) : existingAsset.purchase_at,
                value: value !== undefined ? parseFloat(value) : existingAsset.value,
                is_active: is_active !== undefined ? is_active : existingAsset.is_active
            },
            include: {
                category: true,
                room: true,
                owner: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            }
        });

        return res.json({
            success: true,
            message: "อัปเดตสินทรัพย์สำเร็จ",
            data: {
                id: asset.id.toString(),
                code: asset.code,
                name: asset.name,
                description: asset.description,
                serial_number: asset.serial_number,
                status: asset.status,
                categoryId: asset.categoryId?.toString(),
                roomId: asset.roomId?.toString(),
                ownerId: asset.ownerId?.toString(),
                purchase_at: asset.purchase_at,
                value: asset.value,
                is_active: asset.is_active,
                category: asset.category,
                room: asset.room,
                owner: asset.owner
            }
        });
    } catch (error) {
        console.error('Error updating asset:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการอัปเดตสินทรัพย์", error: error.message });
    }
};

