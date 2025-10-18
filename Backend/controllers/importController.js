import { prisma } from "../config/databaseconnect.js";
import ExcelJS from 'exceljs';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { AssetImportService } from '../services/import/AssetImportService.js';
import { RoomImportService } from '../services/import/RoomImportService.js';
import { CategoryImportService } from '../services/import/CategoryImportService.js';
import { UserImportService } from '../services/import/UserImportService.js';
import { FileManagementService } from '../services/FileManagementService.js';

// Import Assets
export const importAssets = async (req, res) => {
    if (!req.file) {
        return res.json({ success: false, message: "กรุณาเลือกไฟล์ที่ต้องการนำเข้า" });
    }

    try {
        const fileResult = await FileManagementService.handleUploadedFile(req.file, req.user?.id);
        if (!fileResult.success) {
            return res.json({ 
                success: false, 
                message: "ไฟล์ไม่ถูกต้อง", 
                errors: fileResult.errors 
            });
        }

        // อ่านข้อมูลจากไฟล์
        const data = await readFileData(fileResult.filePath, path.extname(fileResult.originalName).toLowerCase());
        
        const result = await AssetImportService.processImport(data, req.user?.id, fileResult.originalName);
        
        await FileManagementService.cleanupAfterProcessing(fileResult.filePath);
        
        return res.json(result);
    } catch (error) {
        console.error('Error importing assets:', error);
        
        if (req.file && fs.existsSync(req.file.path)) {
            await FileManagementService.cleanupAfterProcessing(req.file.path);
        }

        return res.json({ 
            success: false, 
            message: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล", 
            error: error.message 
        });
    }
};

// Import Rooms
export const importRooms = async (req, res) => {
    if (!req.file) {
        return res.json({ success: false, message: "กรุณาเลือกไฟล์ที่ต้องการนำเข้า" });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const filename = req.file.originalname;

    try {
        // อ่านข้อมูลจากไฟล์
        const data = await readFileData(filePath, fileExtension);
        
        const result = await RoomImportService.processImport(data, req.user?.id, filename);
        
        fs.unlinkSync(filePath);
        
        return res.json(result);
    } catch (error) {
        console.error('Error importing rooms:', error);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return res.json({ 
            success: false, 
            message: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล", 
            error: error.message 
        });
    }
};

// Import Categories
export const importCategories = async (req, res) => {
    if (!req.file) {
        return res.json({ success: false, message: "กรุณาเลือกไฟล์ที่ต้องการนำเข้า" });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const filename = req.file.originalname;

    try {
        // อ่านข้อมูลจากไฟล์
        const data = await readFileData(filePath, fileExtension);
        
        const result = await CategoryImportService.processImport(data, req.user?.id, filename);
        
        fs.unlinkSync(filePath);
        
        return res.json(result);
    } catch (error) {
        console.error('Error importing categories:', error);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return res.json({ 
            success: false, 
            message: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล", 
            error: error.message 
        });
    }
};

// Import Users
export const importUsers = async (req, res) => {
    if (!req.file) {
        return res.json({ success: false, message: "กรุณาเลือกไฟล์ที่ต้องการนำเข้า" });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const filename = req.file.originalname;

    try {
        // อ่านข้อมูลจากไฟล์
        const data = await readFileData(filePath, fileExtension);
        
        // ใช้ UserImportService
        const result = await UserImportService.processImport(data, req.user?.id, filename);
        
        // ลบไฟล์ที่อัปโหลด
        fs.unlinkSync(filePath);
        
        return res.json(result);
    } catch (error) {
        console.error('Error importing users:', error);
        
        // ลบไฟล์ที่อัปโหลด
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return res.json({ 
            success: false, 
            message: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล", 
            error: error.message 
        });
    }
};

// ดาวน์โหลด template ไฟล์
export const downloadTemplate = async (req, res) => {
    try {
        const { type } = req.params; // asset, room, category, user
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${type.charAt(0).toUpperCase() + type.slice(1)} Template`);

        let headers = [];
        let sampleData = [];

        switch (type) {
            case 'asset':
                headers = [
                    'code', 'name', 'description', 'serial_number',
                    'categoryName', 'roomCode', 'ownerEmail', 'status',
                    'purchase_at', 'value', 'is_active'
                ];
                sampleData = [
                    'ASSET001', 'คอมพิวเตอร์', 'คอมพิวเตอร์สำหรับใช้งานทั่วไป', 'SN123456',
                    'คอมพิวเตอร์', 'ROOM001', 'admin@example.com', 'AVAILABLE', '2024-01-01', '25000', 'true'
                ];
                break;
            case 'room':
                headers = ['code', 'name', 'description'];
                sampleData = ['ROOM001', 'ห้องประชุมใหญ่', 'ห้องประชุมสำหรับการประชุมใหญ่'];
                break;
            case 'category':
                headers = ['name', 'description'];
                sampleData = ['คอมพิวเตอร์', 'อุปกรณ์คอมพิวเตอร์และเทคโนโลยี'];
                break;
            case 'user':
                headers = ['firstname', 'lastname', 'email', 'username', 'phone', 'role'];
                sampleData = ['สมชาย', 'ใจดี', 'somchai@example.com', 'somchai', '0812345678', 'OWNER'];
                break;
            default:
                return res.json({ success: false, message: "ประเภท template ไม่ถูกต้อง" });
        }

        worksheet.addRow(headers);

        // กำหนด style สำหรับ header
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // เพิ่มข้อมูลตัวอย่าง
        worksheet.addRow(sampleData);

        // ปรับความกว้างของคอลัมน์
        worksheet.columns.forEach(column => {
            column.width = 15;
        });

        // ส่งไฟล์
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${type}_template.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error creating template:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการสร้าง template", error: error.message });
    }
};

// ดึงประวัติการ import
export const getImportHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, type } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = type ? { importType: type } : {};

        const imports = await prisma.excelImport.findMany({
            where: whereClause,
            skip: offset,
            take: parseInt(limit),
            include: {
                user: {
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

        const total = await prisma.excelImport.count({ where: whereClause });

        return res.json({
            success: true,
            data: {
                imports: imports.map(importRecord => ({
                    id: importRecord.id.toString(),
                    filename: importRecord.filename,
                    importType: importRecord.importType,
                    importedBy: importRecord.user ? {
                        id: importRecord.user.id.toString(),
                        name: `${importRecord.user.firstname} ${importRecord.user.lastname}`,
                        email: importRecord.user.email
                    } : null,
                    totalRows: importRecord.totalRows,
                    successRows: importRecord.successRows,
                    failedRows: importRecord.failedRows,
                    errorLogUrl: importRecord.errorLogUrl,
                    created_at: importRecord.created_at
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching import history:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงประวัติการ import", error: error.message });
    }
};

// ดึงรายละเอียดการ import
export const getImportDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const importRecord = await prisma.excelImport.findUnique({
            where: { id: BigInt(id) },
            include: {
                user: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            }
        });

        if (!importRecord) {
            return res.json({ success: false, message: "ไม่พบข้อมูลการ import" });
        }

        // อ่านไฟล์ error log ถ้ามี
        let errorLog = null;
        if (importRecord.errorLogUrl) {
            try {
                const errorLogPath = path.join(process.cwd(), 'uploads', importRecord.errorLogUrl);
                if (fs.existsSync(errorLogPath)) {
                    errorLog = fs.readFileSync(errorLogPath, 'utf8');
                }
            } catch (error) {
                console.error('Error reading error log:', error);
            }
        }

        return res.json({
            success: true,
            data: {
                id: importRecord.id.toString(),
                filename: importRecord.filename,
                importType: importRecord.importType,
                importedBy: importRecord.user ? {
                    id: importRecord.user.id.toString(),
                    name: `${importRecord.user.firstname} ${importRecord.user.lastname}`,
                    email: importRecord.user.email
                } : null,
                totalRows: importRecord.totalRows,
                successRows: importRecord.successRows,
                failedRows: importRecord.failedRows,
                errorLogUrl: importRecord.errorLogUrl,
                errorLog: errorLog,
                created_at: importRecord.created_at
            }
        });
    } catch (error) {
        console.error('Error fetching import detail:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงรายละเอียดการ import", error: error.message });
    }
};

// ฟังก์ชันอ่านไฟล์ข้อมูล
const readFileData = (filePath, fileExtension) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (fileExtension === '.csv') {
                const results = [];
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (data) => {
                        results.push(processRowData(data));
                    })
                    .on('end', () => resolve(results))
                    .on('error', reject);
            } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.readFile(filePath);

                const worksheet = workbook.getWorksheet(1);
                const results = [];

                worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                    if (rowNumber === 1) return; // ข้าม header

                    const rowData = {};
                    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        const header = worksheet.getRow(1).getCell(colNumber).value;
                        if (header) {
                            let value = cell.value;

                            // จัดการกับ object types
                            if (typeof value === 'object' && value !== null) {
                                if (value.text !== undefined) {
                                    value = value.text;
                                } else if (value.formula !== undefined) {
                                    value = value.result || value.formula;
                                } else if (value.error !== undefined) {
                                    value = null;
                                } else {
                                    console.warn(`Unexpected object type for cell value:`, value);
                                    value = null;
                                }
                            }

                            rowData[header] = value;
                        }
                    });

                    // ตรวจสอบว่ามีข้อมูลในแถว
                    if (Object.values(rowData).some(value => value !== null && value !== undefined && value !== '')) {
                        results.push(processRowData(rowData));
                    }
                });

                resolve(results);
            } else {
                reject(new Error("รองรับเฉพาะไฟล์ .xlsx, .xls และ .csv เท่านั้น"));
            }
        } catch (error) {
            reject(error);
        }
    });
};

// ฟังก์ชันประมวลผลข้อมูลแถว
const processRowData = (data) => {
    const processedData = {};
    Object.keys(data).forEach(key => {
        let value = data[key];

        // จัดการกับ object types
        if (typeof value === 'object' && value !== null) {
            console.warn(`Unexpected object type for field ${key}:`, value);
            value = null;
        }

        if (value !== null && value !== undefined && value !== '') {
            // แปลงเป็น String สำหรับ field ที่เป็น code, name, email
            if (key.toLowerCase().includes('code') ||
                key.toLowerCase().includes('name') ||
                key.toLowerCase().includes('email')) {
                processedData[key] = String(value).trim();
            } else if (key.toLowerCase() === 'is_active') {
                processedData[key] = String(value).trim();
            } else {
                processedData[key] = value;
            }
        } else {
            processedData[key] = value;
        }
    });
    return processedData;
};
