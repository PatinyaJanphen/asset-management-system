import { prisma } from '../config/databaseconnect.js';

export const getDashboardSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const totalAsset = await prisma.asset.count()
        const totalInuse = await prisma.asset.count({ where: { status: "ASSIGNED" } })
        const totalReair = await prisma.asset.count({ where: { status: "MAINTENANCE" } })
        const totalUsers = await prisma.user.count();

        const assetByCategoryRaw = await prisma.asset.groupBy({ by: ['categoryId'], _count: { id: true }, });
        const assetByCategory = await Promise.all(
            assetByCategoryRaw.map(async (c) => {
                const category = await prisma.category.findUnique({ where: { id: c.categoryId }, select: { name: true }, });
                return {
                    categoryId: c.categoryId,
                    categoryName: category?.name || "Uncategorized",
                    count: c._count.id,
                };
            })
        );

        let dateFilter = { purchase_at: { not: null } };
        let isDefaultRange = false;
        if (startDate && endDate) {
            dateFilter = {
                purchase_at: {
                    not: null,
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            };
        } else {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 11);

            dateFilter = {
                purchase_at: {
                    not: null,
                    gte: startDate,
                    lte: endDate
                }
            };
            isDefaultRange = true;
        }

        const allAssets = await prisma.asset.findMany({ where: dateFilter, select: { purchase_at: true } });

        const monthlyData = {};
        allAssets.forEach(asset => {
            const date = new Date(asset.purchase_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        });

        let assetsAddedByMonth;
        if (isDefaultRange) {
            const today = new Date();
            const months = [];

            for (let i = 11; i >= 0; i--) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                months.push({
                    month: date.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }),
                    count: monthlyData[monthKey] || 0
                });
            }
            assetsAddedByMonth = months;
        } else {
            assetsAddedByMonth = Object.entries(monthlyData)
                .map(([monthKey, count]) => {
                    const [year, month] = monthKey.split('-');
                    const date = new Date(year, month - 1);
                    return {
                        month: date.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }),
                        count: count
                    };
                })
                .sort((a, b) => {
                    const dateA = new Date(a.month);
                    const dateB = new Date(b.month);
                    return dateA - dateB;
                });
        }

        res.json({ success: true, data: { totalAsset, totalInuse, totalReair, totalUsers, assetByCategory, assetsAddedByMonth } })
    } catch (error) {
        res.json({ success: false, message: 'Server error', error: error.message });
    }
}

export const getDashboardSummaryOwner = async (req, res) => {
    try {
        const currentUser = req.user

        const totalAsset = await prisma.asset.count({ where: { ownerId: currentUser.id } })
        const totalInuse = await prisma.asset.count({ where: { ownerId: currentUser.id, status: "ASSIGNED" } })
        const totalReair = await prisma.asset.count({ where: { ownerId: currentUser.id, status: "MAINTENANCE" } })

        const assetByCategoryRaw = await prisma.asset.groupBy({ where: { ownerId: currentUser.id }, by: ['categoryId'], _count: { id: true }, });
        const assetByCategory = await Promise.all(
            assetByCategoryRaw.map(async (c) => {
                const category = await prisma.category.findUnique({
                    where: { id: c.categoryId },
                    select: { name: true },
                });
                return {
                    categoryId: c.categoryId,
                    categoryName: category?.name || "Uncategorized",
                    count: c._count.id,
                };
            })
        );

        res.json({ success: true, data: { totalAsset, totalInuse, totalReair, assetByCategory } })
    } catch (error) {
        res.json({ success: false, message: 'Server error', error: error.message });
    }
}