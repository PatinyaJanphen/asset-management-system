import { prisma } from '../config/databaseconnect.js';

export const createCategory = async (req, res) => {
    const { name, description } = req.body
    if (!name || !description) return res.json({ success: false, message: "All fields are required" })

    try {
        const existingCategory = await prisma.category.findUnique({ where: { name, } })
        if (existingCategory) return res.json({ success: false, message: "Category name already exists" })

        const newCategory = await prisma.category.create({ data: { name, description } })

        return res.json({ success: true, message: "Create new category successful" })
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message })
    }
}

export const updateCategory = async (req, res) => {
    const { id } = req.params
    const { name, description } = req.body
    if (!id || !name || !description) return res.json({ success: false, message: "All fields are required" })

    try {
        const existingCategory = await prisma.category.findUnique({ where: { name, NOT: { id: BigInt(id) } } })
        if (existingCategory) return res.json({ success: false, message: "Category name already exists" })

        const updatedCategory = await prisma.category.update({
            where: { id: BigInt(id) },
            data: { name, description }
        })

        return res.json({
            success: true, message: "Update category successful",
            data: {
                id: Number(updatedCategory.id),
                name: updatedCategory.name,
                description: updatedCategory.description
            }
        })
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message })
    }
}



export const getAllCategory = async (req, res) => {
    try {
        const categorys = await prisma.category.findMany()

        res.json({
            success: true,
            message: "All category data fetched successfully",
            data: categorys.map(c => ({
                id: Number(c.id),
                name: c.name,
                description: c.description
            }))
        })
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message })
    }
}

export const getCategory = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) return res.json({ success: false, message: "Missing category ID" })

        const category = await prisma.category.findUnique({ where: { id: BigInt(id) } })
        if (!category) return res.json({ success: false, message: "Category not found" })

        res.json({
            success: true,
            message: "All category data fetched successfully",
            data: {
                id: Number(category.id),
                name: category.name,
                description: category.description
            }
        })
    } catch (error) {
        return res.json({ success: false, message: "Server error", error: error.message })
    }
}