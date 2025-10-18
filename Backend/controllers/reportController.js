import { prisma } from '../config/databaseconnect.js';
import ExcelJS from 'exceljs';

export const generateAnnualReport = async (req, res) => {
    try {
        const { year, categoryIds, roomIds } = req.body;

        const whereCondition = {
            purchase_at: {
                gte: new Date(year, 0, 1), // เริ่มต้นปี
                lt: new Date(year + 1, 0, 1) // สิ้นสุดปี
            }
        };

        if (categoryIds && categoryIds.length > 0) {
            whereCondition.categoryId = {
                in: categoryIds
            };
        }

        if (roomIds && roomIds.length > 0) {
            whereCondition.roomId = {
                in: roomIds
            };
        }

        const assets = await prisma.asset.findMany({
            where: whereCondition,
            include: {
                category: {
                    select: { name: true }
                },
                room: {
                    select: { name: true }
                },
                owner: {
                    select: { firstname: true, lastname: true }
                }
            }
        });

        if (assets.length === 0) {
            return res.json({
                success: false,
                message: 'ไม่พบข้อมูลครุภัณฑ์ตามเงื่อนไขที่ระบุ'
            });
        }

        res.json({
            success: true,
            data: {
                assets: assets.map(asset => ({
                    id: asset.id,
                    code: asset.code,
                    name: asset.name,
                    serialNumber: asset.serial_number,
                    category: asset.category?.name || 'ไม่ระบุหมวดหมู่',
                    room: asset.room?.name || 'ไม่ระบุห้อง',
                    owner: asset.owner ? `${asset.owner.firstname} ${asset.owner.lastname}` : 'ไม่ระบุผู้รับผิดชอบ',
                    status: asset.status,
                    value: asset.value,
                    purchaseAt: asset.purchase_at
                }))
            }
        });

    } catch (error) {
        console.error('Error generating annual report:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสร้างรายงาน',
            error: error.message
        });
    }
};



export const exportReportCSV = async (req, res) => {
    try {
        const { year, categoryIds, roomIds } = req.body;

        if (!year) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุปี'
            });
        }

        let whereCondition = {
            purchase_at: {
                gte: new Date(year, 0, 1),
                lt: new Date(year + 1, 0, 1)
            }
        };

        if (categoryIds && categoryIds.length > 0) {
            whereCondition.categoryId = { in: categoryIds };
        }

        if (roomIds && roomIds.length > 0) {
            whereCondition.roomId = { in: roomIds };
        }

        const assets = await prisma.asset.findMany({
            where: whereCondition,
            include: {
                category: {
                    select: { name: true }
                },
                room: {
                    select: { name: true }
                },
                owner: {
                    select: { firstname: true, lastname: true }
                }
            },
            orderBy: {
                purchase_at: 'desc'
            }
        });

        if (assets.length === 0) {
            return res.json({
                success: false,
                message: 'ไม่พบข้อมูลครุภัณฑ์ตามเงื่อนไขที่ระบุ'
            });
        }

        // สร้างไฟล์ Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('รายงานประจำปี');

        // กำหนด headers
        worksheet.columns = [
            { header: 'หมายเลขสินทรัพย์', key: 'code', width: 15 },
            { header: 'ชื่อครุภัณฑ์', key: 'name', width: 30 },
            { header: 'ราคา', key: 'price', width: 15 },
            { header: 'หมายเลขซีเรียล', key: 'serialNumber', width: 20 },
            { header: 'หมวดหมู่', key: 'category', width: 20 },
            { header: 'สถานะ', key: 'status', width: 15 },
            { header: 'ผู้รับผิดชอบ', key: 'owner', width: 25 },
            { header: 'สถานที่ใช้งาน', key: 'room', width: 20 },
        ];

        assets.forEach(asset => {
            worksheet.addRow({
                code: asset.code || '',
                name: asset.name || '',
                price: asset.value || 0,
                serialNumber: asset.serial_number || '',
                category: asset.category?.name || '',
                status: asset.status,
                owner: asset.owner ? `${asset.owner.firstname} ${asset.owner.lastname}` : '',
                room: asset.room?.name || '',
            });
        });

        // จัดรูปแบบ headers
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6FA' }
        };
        worksheet.getColumn('price').numFmt = '#,##0.00';

        // ตั้งค่า response headers 
        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const yearExport = now.getFullYear();
        const exportDate = `${day}${month}${yearExport}`;
        const filename = `annual_report_${year}_${exportDate}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting report Excel:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการส่งออกรายงาน',
            error: error.message
        });
    }
};
