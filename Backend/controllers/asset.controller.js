import { prisma } from "../config/databaseconnect.js";

//  Create Asset 
export const createAsset = async (req, res) => {
    const { name, category, location, status } = req.body;

    if (!name || !category || !location) {
        return res.json({ success: false, message: "Name, category and location are required" });
    }

    try {
        const asset = await prisma.asset.create({
            data: { name, category, location, status },
        });

        return res.json({ success: true, message: "Asset created", asset });
    } catch (error) {
        return res.json({ success: false, message: "Failed to create asset", error: error.message });
    }
};

//  Get All Assets 
export const getAllAssets = async (req, res) => {
    try {
        const assets = await prisma.asset.findMany();
        return res.json({ success: true, assets });
    } catch (error) {
        return res.json({ success: false, message: "Failed to fetch assets", error: error.message });
    }
};

//  Get Asset By ID 
export const getAssetById = async (req, res) => {
    const { id } = req.body;

    try {
        const asset = await prisma.asset.findUnique({ where: { id: parseInt(id) } });
        if (!asset) return res.json({ success: false, message: "Asset not found" });

        return res.json({ success: true, asset });
    } catch (error) {
        return res.json({ success: false, message: "Failed to fetch asset", error: error.message });
    }
};

//  Update Asset 
export const updateAsset = async (req, res) => {
    const { userId, name, category, location, status, assignedTo } = req.body;

    try {
        const asset = await prisma.asset.update({
            where: { id: parseInt(userId) },
            data: { name, category, location, status, assignedTo },
        });

        return res.json({ success: true, message: "Asset updated", asset });
    } catch (error) {
        return res.json({ success: false, message: "Failed to update asset", error: error.message });
    }
};

//  Delete Asset 
export const deleteAsset = async (req, res) => {
    const { id } = req.body;

    try {
        await prisma.asset.delete({ where: { id: parseInt(id) } });
        return res.json({ success: true, message: "Asset deleted" });
    } catch (error) {
        return res.json({ success: false, message: "Failed to delete asset", error: error.message });
    }
};
